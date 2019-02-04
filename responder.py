import json

players = []
data = {}

class Responder:
    request = None
    client = None
    server = None

    def __init__(self, client, server, message):
        try:
            self.request = json.loads(message)
        except json.JSONDecodeError:
            self.send({"error": "njf"})
        self.client = client
        self.server = server

    def send(self, message):
        message['response_id'] = self.request['request_id']
        string_message = json.dumps(message)
        self.server.send_message(self.client, string_message)

