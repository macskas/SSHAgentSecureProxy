const connections = new (function () {
    let myconnections = {};
    let counter = 0;
    let count = 0;

    this.add = function (id, client, client_socket) {
        myconnections[id] = { client: client, client_socket: client_socket };
        counter++;
        count++;
        return counter;
    }

    this.del = function (id) {
        delete myconnections[id];
        count--;
    }

    this.closeAll = function () {
        for (let id in myconnections) {
            myconnections[id].client_socket.destroy();
        }
    }

    this.showCount = function () {
        console.log("Connection count:", count);
    }
})();

module.exports = connections;
