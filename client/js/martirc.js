/**
 * MartIrc constructor
 *
 * @contructor
 *
 */
MartIrc = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    MartIrc.server = new Server();
    MartIrc.channels = new Array();

    MartIrc.outgoingMessage = new OutgoingMessage();
    MartIrc.incomingMessage = null;

    MartIrc.ircConnection = null;
    MartIrc.storage = new Storage();
    self.utils = new Utils();

    self.init();
    self.bindEvents();
};

/**
 * MartIrc init
 *
 */
MartIrc.prototype.init = function() {
    var self = this;

    if(MartIrc.storage.getNickname()){
        $('#nickname').val(MartIrc.storage.getNickname());
    }

    $('input[name=connectOnStartup]').prop('checked', MartIrc.storage.getConnectOnStartup());

    if(MartIrc.storage.getConnectOnStartup()){
        self.connect();
    }
};

MartIrc.prototype.bindEvents = function() {
    var self = this;

    $('#connectButton').click(function() {
        self.connect();
    });

    $('#connectOnStartup').click(function(event) {
        MartIrc.storage.setConnectOnStartup($('input[name=connectOnStartup]').is(':checked'));
    });

    $('#nickname').change(function(event) {
        MartIrc.storage.setNickname($('#nickname').val());
    });

    $('#prompt form').submit(function(event) {
        event.preventDefault();

        MartIrc.outgoingMessage.processArgs();
    });

    $('#channels a.server').live('click', function(event) {
        MartIrc.server.focus();
    });

    $('#prompt form input').focus();
};

MartIrc.prototype.connect = function() {
    var self = this;

    if (MartIrc.ircConnection && MartIrc.ircConnection.connected()) {
        MartIrc.ircConnection.disconnect();

        for(name in MartIrc.channels){
            MartIrc.channels[name].destroy();
        }

        MartIrc.channels = new Array();

        MartIrc.ircConnection = null;
    }

    MartIrc.ircConnection = new IrcConnection({
        nodeServerHost: $('#nodeServerHost').val(),
        nodeServerPort: parseInt($('#nodeServerPort').val()),
        ircServerHost: $('#ircServerHost').val(),
        ircServerPort: parseInt($('#ircServerPort').val()),
        nickname: $('#nickname').val()
    });

    // set the name of the server in the title bar
    MartIrc.server.name = MartIrc.ircConnection.settings.ircServerHost;
    MartIrc.server.focus();

    $(MartIrc.ircConnection).bind('irc.server', function(event, data) {
        $(self).trigger('irc.server', data);

        MartIrc.server.addMessage(data.raw);

        MartIrc.server.scrollAtTheEnd();

        MartIrc.incomingMessage = new IncomingMessage();
        MartIrc.incomingMessage.parse(data);
    });
};
