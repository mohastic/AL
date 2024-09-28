import socket

# Function to find an open port
def find_open_port(start_port=1024, end_port=65535):
    for port in range(start_port, end_port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:  # Port is open
                return port
    return None

# Find an open port
open_port = find_open_port()
if open_port:
    print(f"Open port found: {open_port}")
else:
    print("No open port found.")