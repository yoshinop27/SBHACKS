"""
Interactive Voice Agent with Automatic Language Detection
Uses raw websockets to bypass Deepgram SDK Pydantic issues with Python 3.14
Dynamically switches TTS voice based on detected language
"""

import sounddevice as sd
import numpy as np
import os
import threading
import time
import json
import signal
import sys
import re
import websockets.sync.client as ws_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# --- CONFIGURATION ---
SAMPLE_RATE = 24000  # Deepgram default for Voice Agent
CHANNELS = 1
CHUNK_SIZE = 2048
DEEPGRAM_WS_URL = "wss://agent.deepgram.com/v1/agent/converse"

# Language to TTS model mapping (Deepgram Aura 2 voices)
LANGUAGE_TTS_MODELS = {
    "en": "aura-2-asteria-en",      # English - American female
    "es": "aura-2-andromeda-es",    # Spanish
    "fr": "aura-2-andromeda-fr",    # French
    "de": "aura-2-andromeda-de",    # German
    "it": "aura-2-andromeda-it",    # Italian
    "pt": "aura-2-andromeda-pt",    # Portuguese
    "nl": "aura-2-andromeda-nl",    # Dutch
    "hi": "aura-2-andromeda-hi",    # Hindi
    "ja": "aura-2-andromeda-ja",    # Japanese
    "ko": "aura-2-andromeda-ko",    # Korean
    "zh": "aura-2-andromeda-zh",    # Chinese
    "ru": "aura-2-andromeda-ru",    # Russian
    "pl": "aura-2-andromeda-pl",    # Polish
    "tr": "aura-2-andromeda-tr",    # Turkish
    "uk": "aura-2-andromeda-uk",    # Ukrainian
    "sv": "aura-2-andromeda-sv",    # Swedish
    "da": "aura-2-andromeda-da",    # Danish
    "no": "aura-2-andromeda-no",    # Norwegian
}
DEFAULT_TTS_MODEL = "aura-2-asteria-en"

def detect_language(text: str) -> str:
    """Simple language detection based on character patterns"""
    if not text:
        return "en"
    
    # Check for specific scripts
    if re.search(r'[\u4e00-\u9fff]', text):  # Chinese characters
        return "zh"
    if re.search(r'[\u3040-\u309f\u30a0-\u30ff]', text):  # Japanese hiragana/katakana
        return "ja"
    if re.search(r'[\uac00-\ud7af]', text):  # Korean hangul
        return "ko"
    if re.search(r'[\u0400-\u04ff]', text):  # Cyrillic (Russian, Ukrainian)
        return "ru"
    if re.search(r'[\u0900-\u097f]', text):  # Devanagari (Hindi)
        return "hi"
    if re.search(r'[\u0600-\u06ff]', text):  # Arabic script
        return "ar"
    
    # For Latin scripts, use common word patterns
    text_lower = text.lower()
    
    # Spanish indicators
    if any(w in text_lower for w in ['hola', 'gracias', 'como', 'estas', 'que', 'muy', 'pero', 'porque']):
        return "es"
    # French indicators
    if any(w in text_lower for w in ['bonjour', 'merci', 'comment', 'vous', 'tres', 'mais', 'pourquoi', 'oui']):
        return "fr"
    # German indicators
    if any(w in text_lower for w in ['guten', 'danke', 'bitte', 'wie', 'ich', 'nicht', 'aber', 'warum']):
        return "de"
    # Italian indicators
    if any(w in text_lower for w in ['ciao', 'grazie', 'come', 'stai', 'molto', 'perche', 'buon']):
        return "it"
    # Portuguese indicators
    if any(w in text_lower for w in ['ola', 'obrigado', 'como', 'voce', 'muito', 'mas', 'porque', 'bom']):
        return "pt"
    # Dutch indicators
    if any(w in text_lower for w in ['hallo', 'dank', 'hoe', 'gaat', 'het', 'niet', 'maar', 'waarom']):
        return "nl"
    
    return "en"  # Default to English

def play_audio(audio_data: bytes):
    """Plays raw linear16 audio"""
    if not audio_data:
        return
    audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
    sd.play(audio_array, samplerate=SAMPLE_RATE)
    sd.wait()

def main():
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        print("[ERROR] No API Key found in .env.local")
        return

    # State tracking
    audio_buffer = bytearray()
    settings_applied = False
    connection_closed = False
    agent_speaking = False  # Mute mic while agent speaks to prevent feedback loop
    current_language = "en"  # Track detected language for dynamic TTS switching
    current_tts_model = DEFAULT_TTS_MODEL
    
    # Headers for authentication
    headers = {
        "Authorization": f"Token {api_key}"
    }

    print("[CONNECTING] Connecting to Deepgram...")
    
    try:
        with ws_client.connect(DEEPGRAM_WS_URL, additional_headers=headers) as websocket:
            print("[OK] Connected to Deepgram")
            
            def listen_for_messages():
                nonlocal audio_buffer, settings_applied, connection_closed, agent_speaking
                nonlocal current_language, current_tts_model
                try:
                    while not connection_closed:
                        try:
                            message = websocket.recv(timeout=0.1)
                            
                            # Handle binary audio data
                            if isinstance(message, bytes):
                                audio_buffer.extend(message)
                                continue
                            
                            # Handle JSON messages
                            try:
                                data = json.loads(message)
                                msg_type = data.get("type", "Unknown")
                                
                                if msg_type == "Welcome":
                                    print(f"[OK] Welcome: {data.get('request_id', 'N/A')}")
                                
                                elif msg_type == "SettingsApplied":
                                    settings_applied = True
                                    print("[OK] Settings applied successfully")
                                
                                elif msg_type == "Error":
                                    print(f"[ERROR] API Error: {data.get('description', str(data))}")
                                
                                elif msg_type == "ConversationText":
                                    role = data.get("role", "unknown")
                                    text = data.get("text", "")
                                    print(f"[{role.upper()}] {text}")
                                    
                                    # Detect language from USER text and switch TTS if needed
                                    if role == "user" and text:
                                        detected_lang = detect_language(text)
                                        if detected_lang != current_language:
                                            current_language = detected_lang
                                            new_model = LANGUAGE_TTS_MODELS.get(detected_lang, DEFAULT_TTS_MODEL)
                                            if new_model != current_tts_model:
                                                current_tts_model = new_model
                                                # Send UpdateSpeak to change TTS voice
                                                update_msg = {
                                                    "type": "UpdateSpeak",
                                                    "speak": {
                                                        "provider": {
                                                            "type": "deepgram",
                                                            "model": new_model
                                                        }
                                                    }
                                                }
                                                try:
                                                    websocket.send(json.dumps(update_msg))
                                                    print(f"[LANG] Switched to {detected_lang.upper()} voice: {new_model}")
                                                except Exception as e:
                                                    print(f"[WARN] Could not update TTS: {e}")
                                
                                elif msg_type == "AgentStartedSpeaking":
                                    agent_speaking = True  # Mute mic
                                    audio_buffer = bytearray()
                                    print("[AGENT] Speaking...")
                                
                                elif msg_type == "AgentAudioDone":
                                    print("[AGENT] Playing audio...")
                                    play_audio(bytes(audio_buffer))
                                    audio_buffer = bytearray()
                                    # Wait for audio to fully stop reverberating before unmuting
                                    time.sleep(0.5)
                                    agent_speaking = False  # Unmute mic
                                    print("[MIC] Listening...")
                                
                                elif msg_type == "UserStartedSpeaking":
                                    pass  # Silent
                                
                                elif msg_type == "AgentThinking":
                                    agent_speaking = True  # Mute mic during thinking too
                                    print("[AGENT] Thinking...")
                                
                                elif msg_type in ("History", "UserAudioDone", "PromptUpdated", "Warning"):
                                    pass  # Silent - these are internal/duplicate messages
                                
                                else:
                                    print(f"[DEBUG] {msg_type}")
                                    
                            except json.JSONDecodeError:
                                print(f"[DEBUG] Non-JSON message: {message[:100]}")
                                
                        except TimeoutError:
                            continue
                        except Exception as e:
                            if "closed" in str(e).lower():
                                break
                            print(f"[ERROR] Receive error: {e}")
                            break
                            
                except Exception as e:
                    print(f"[ERROR] Listener error: {e}")
                finally:
                    connection_closed = True
                    print("[OK] Connection Closed")
            
            # Start listener thread
            listener_thread = threading.Thread(target=listen_for_messages, daemon=True)
            listener_thread.start()
            
            # Wait for Welcome message
            time.sleep(0.5)

            # Build settings with integer sample_rates
            settings = {
                "type": "Settings",
                "audio": {
                    "input": {
                        "encoding": "linear16",
                        "sample_rate": SAMPLE_RATE  # Integer, not float
                    },
                    "output": {
                        "encoding": "linear16",
                        "sample_rate": SAMPLE_RATE,  # Integer, not float
                        "container": "none"
                    }
                },
                "agent": {
                    "listen": {
                        "provider": {
                            "type": "deepgram",
                            "model": "nova-3"
                        }
                    },
                    "think": {
                        "provider": {
                            "type": "open_ai",
                            "model": "gpt-4o-mini"
                        },
                        "prompt": "You are a helpful multilingual assistant. ALWAYS reply in the SAME language the user speaks to you. If they speak Spanish, reply in Spanish. If they speak French, reply in French. Match their language exactly."
                    },
                    "speak": {
                        "provider": {
                            "type": "deepgram",
                            "model": current_tts_model
                        }
                    },
                    "greeting": "Hello! I can speak multiple languages. Try talking to me in your preferred language."
                }
            }

            print("[SEND] Sending settings...")
            websocket.send(json.dumps(settings))
            
            # Wait for settings to be applied
            print("[WAIT] Waiting for settings confirmation...")
            timeout = 5
            start = time.time()
            while not settings_applied and not connection_closed and (time.time() - start) < timeout:
                time.sleep(0.1)
            
            if connection_closed:
                print("[ERROR] Connection closed before settings were applied.")
                return
                
            if not settings_applied:
                print("[WARN] Settings not confirmed, but connection is open. Proceeding...")

            # Microphone Input Loop
            def mic_callback(indata, frames, time_info, status):
                # Don't send audio while agent is speaking (prevents feedback loop)
                if connection_closed or agent_speaking:
                    return
                audio_bytes = (indata * 32767).astype(np.int16).tobytes()
                try:
                    websocket.send(audio_bytes)
                except Exception:
                    pass  # Connection likely closed

            print("[READY] Speak into your mic... (Ctrl+C to stop)")
            try:
                with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, 
                                    callback=mic_callback, blocksize=CHUNK_SIZE):
                    while not connection_closed:
                        time.sleep(0.1)
            except KeyboardInterrupt:
                print("\n[STOP] Stopping...")
            finally:
                connection_closed = True
                sd.stop()  # Stop any playing audio
                try:
                    websocket.close()
                except Exception:
                    pass
                print("[OK] Cleanup complete")
                
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
    finally:
        sd.stop()  # Ensure audio is stopped

if __name__ == "__main__":
    main()