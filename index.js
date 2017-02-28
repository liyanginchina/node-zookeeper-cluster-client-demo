var zookeeper = require('node-zookeeper-client');

var client = zookeeper.createClient('192.168.112.129:2181,192.168.112.130:2181,192.168.112.131:2181');
//var path = 'foo';

client.once('connected', function () {
    console.log('Connected to the server.');

    /*client.create(path, function (error) {
        if (error) {
            console.log('Failed to create node: %s due to: %s.', path, error);
        } else {
            console.log('Node: %s is successfully created.', path);
        }
 
        client.close();
    });*/

    client.create(
        '/test',
        new Buffer('data'),
        zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL,
        function (error, path) {
            if (error) {
                console.log(error.stack);
                return;
            }

            console.log('Node: %s is created.', path);
        }
    );
});

client.connect();