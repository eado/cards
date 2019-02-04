from threading import Thread
from websocket_server import WebsocketServer

from responder import Responder

def message_received(client, server, message):
    p = Thread(target=start_responder, args=(client, server, message))
    p.daemon = True
    p.start()


def start_responder(client, server, message):
    Responder(client, server, message)


def start_server():
    server = WebsocketServer(9001, host='0.0.0.0')
    server.set_fn_message_received(message_received)
    server.run_forever()

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\nExiting...")
        sys.exit(0)