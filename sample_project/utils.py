import pickle

# Hardcoded secret
api_secret = "super_secret_token_12345"

def deserialize_state(raw_data: bytes):
    # Vulnerability: Insecure pickle deserialization
    return pickle.loads(raw_data)
