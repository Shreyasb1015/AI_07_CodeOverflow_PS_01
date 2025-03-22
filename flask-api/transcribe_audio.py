import os
import torch
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
import librosa
import gc

def transcribe_audio(audio_file_path):
    """
    Transcribe an audio file using the Whisper model, optimized for GTX 1650.
    
    Args:
        audio_file_path (str): Path to the audio file to transcribe
        
    Returns:
        str: The transcribed text from the audio file
        None: If an error occurs during transcription
    """
    try:
        if not os.path.exists(audio_file_path):
            print(f"Error: Audio file not found at {audio_file_path}")
            return None
        
        # Free up memory before loading the model
        gc.collect()
        torch.cuda.empty_cache()
        
        # Check if CUDA is available
        if torch.cuda.is_available():
            device = "cuda"
            print(f"Using GPU: {torch.cuda.get_device_name(0)}")
            print(f"Available VRAM: {torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB")
        else:
            device = "cpu"
            print("CUDA not available. Using CPU instead.")
        
        print(f"Loading Whisper model components...")
        
        # For GTX 1650 with limited VRAM, use medium model instead of large
        model_name = "openai/whisper-medium"  # Use medium model to fit in 4GB VRAM
        
        # Load processor
        processor = AutoProcessor.from_pretrained(model_name)
        
        # Load model with memory optimizations
        model = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_name,
            torch_dtype=torch.float16,  # Use half precision
            low_cpu_mem_usage=True,     # Reduce CPU memory usage during loading
            use_safetensors=True        # More memory-efficient tensor storage
        )
        
        # Move model to GPU and optimize for limited memory
        model = model.to(device)
        
        print(f"Transcribing audio file: {audio_file_path}")
        
        # Process audio in chunks if it's large
        MAX_AUDIO_LEN = 30 * 16000  # 30 seconds at 16kHz
        speech_array, sampling_rate = librosa.load(audio_file_path, sr=16000)
        
        # If audio is very long, process in chunks
        if len(speech_array) > MAX_AUDIO_LEN:
            chunks = [speech_array[i:i+MAX_AUDIO_LEN] for i in range(0, len(speech_array), MAX_AUDIO_LEN)]
            transcribed_texts = []
            
            for i, chunk in enumerate(chunks):
                print(f"Processing chunk {i+1}/{len(chunks)}")
                # Process the input
                input_features = processor(chunk, sampling_rate=16000, return_tensors="pt").input_features
                input_features = input_features.to(device)
                
                # Generate tokens with optimized settings for limited VRAM
                with torch.no_grad():
                    generated_ids = model.generate(
                        input_features, 
                        max_length=256,      # Reduced max length
                        num_beams=2,         # Reduced beam search
                        do_sample=False
                    )
                
                # Decode the tokens to text
                chunk_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                transcribed_texts.append(chunk_text)
                
                # Free memory after each chunk
                del input_features, generated_ids
                torch.cuda.empty_cache()
                
            transcribed_text = " ".join(transcribed_texts)
        else:
            # Process the input
            input_features = processor(speech_array, sampling_rate=16000, return_tensors="pt").input_features
            input_features = input_features.to(device)
            
            # Generate tokens with optimized settings for limited VRAM
            with torch.no_grad():
                generated_ids = model.generate(
                    input_features, 
                    max_length=256,
                    num_beams=2,
                    do_sample=False
                )
            
            # Decode the tokens to text
            transcribed_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        print(f"Transcription completed successfully.")
        
        # Free up memory after processing
        del model, processor
        gc.collect()
        torch.cuda.empty_cache()
        
        return transcribed_text
        
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        return None

# Example usage
if __name__ == "__main__":
    audio_path = "audio.wav"  # Update this to your audio file path
    transcription = transcribe_audio(audio_path)
    
    if transcription:
        print("\nTranscription:")
        print("-" * 50)
        print(transcription)
        print("-" * 50)
    else:
        print("Failed to transcribe audio.")