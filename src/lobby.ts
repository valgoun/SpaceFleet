class lobby {
    socket: SocketIOClient.Socket;
    constructor() {
        this.socket = io.connect("http://localhost:8080");
        $(document).ready(this.Awake);
    }

    Awake() {
        console.log($('#SelectName'));

        $('#caca').submit(() => {
            console.log("caca");
            this.socket.emit('fleetName', $('#fleetName').val());
            $('#SelectName').hide();
            return false;
        });
    }
}

let lb = new lobby();