import os
import subprocess

# Vulnerability: Debug mode enabled
DEBUG = True

def handle_user_command(user_payload: str):
    # Vulnerability: Dangerous eval usage
    print("Evaluating user expression...")
    return eval(user_payload)

def ping_host(host_name: str):
    # Vulnerability: shell=True invocation
    cmd = f"ping -c 1 {host_name}"
    return subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    print("Starting vulnerable sample server on port 5000...")
