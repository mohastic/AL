import socket
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Function to check for an open port
def find_open_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("", 0))  # Bind to any available port
    port = sock.getsockname()[1]
    sock.close()
    return port

# Start a local server on the open port
def run_server(port):
    handler = SimpleHTTPRequestHandler
    httpd = HTTPServer(("0.0.0.0", port), handler)
    print(f"Serving on port {port}...")
    httpd.serve_forever()

# Main function
def main():
    # Find an open port
    open_port = find_open_port()

    # Customize the HTML file to be served
    html_content = """
    <html>
    <head><title>Custom Web Page</title></head>
    <body>
    <h1>Welcome to Your Local Web Page!</h1>
    <p>This is hosted on port {}</p>
    </body>
    </html>
    """.format(open_port)

    # Save the HTML content to a file
    with open("index.html", "w") as f:
        f.write(html_content)

    # Start the web server
    run_server(open_port)

if __name__ == "__main__":
    main()