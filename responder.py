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

        if self.request['request'] == 'getpos':
            self.get_pos()
        elif self.request['request'] == 'move':
            self.move()

    def get_pos(self):
        players.append((self.client, self.request['request_id']))

    def move(self):
        for player, request_id in players:
            message = {'index': self.request['index'], 'x': self.request['x'], 'y': self.request['y'], 'response_id': request_id}
            string_message = json.dumps(message)
            self.server.send_message(player, string_message)

    def send(self, message):
        message['response_id'] = self.request['request_id']
        string_message = json.dumps(message)
        self.server.send_message(self.client, string_message)

