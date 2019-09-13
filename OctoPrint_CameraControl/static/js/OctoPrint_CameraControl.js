$(function() {
    function OctoPrint_CameraControlViewModel(parameters) {
        var self = this;

        self.settings = parameters[0];
	self.control  = parameters[1];

        self.OctoPrint_CameraControl_profiles = ko.observableArray();

        self.enabled_buttons = ko.observableArray();

	self.names = []

        self.camnames = ko.observableArray();

        self.onBeforeBinding = function() {
            self.OctoPrint_CameraControl_profiles(self.settings.settings.plugins.OctoPrint_CameraControl.OctoPrint_CameraControl_profiles());
	    for (var i = 0; i < self.OctoPrint_CameraControl_profiles().length; i++) {
	        self.names.push(self.OctoPrint_CameraControl_profiles()[i]['name']);
            }
	    self.camnames(self.names);
        };

        self.onSettingsBeforeSave = function() {
            self.settings.settings.plugins.OctoPrint_CameraControl.OctoPrint_CameraControl_profiles(self.OctoPrint_CameraControl_profiles.slice(0));
            self.onAfterTabChange();
        };

        self.onEventSettingsUpdated = function(payload) {
            self.OctoPrint_CameraControl_profiles(self.settings.settings.plugins.OctoPrint_CameraControl.OctoPrint_CameraControl_profiles());
        };

	self.chooseCamera = function() {
	   if(self.OctoPrint_CameraControl_profiles().length > 1)
	   {
	      var cameras = self.settings.settings.plugins.multicam.multicam_profiles();
	      var index = 0;
	      ko.utils.arrayForEach(cameras, function (item) {
                if(!item.isButtonEnabled()) {
                 return index;
                }
		index += 1;
              });
           }
	   return 0;
	};

	self.sendCommand = function(selected, commandUrl, commandData) {
           var url = (self.OctoPrint_CameraControl_profiles()[selected]['url'])();
           var user = (self.OctoPrint_CameraControl_profiles()[selected]['user'])();
           var password = (self.OctoPrint_CameraControl_profiles()[selected]['password'])();
	   var data = {'user': user, 'password':password};
           //$.get("http:\/\/"+url+commandUrl,{...data,...commandData});
	   $.ajax({
		url: API_BASEURL + "plugin/OctoPrint_CameraControl",
		type: "POST",
		dataType: "json",
		data: JSON.stringify({
			command: "sendCommand",
			url: "http:\/\/"+url+commandUrl,
			commandData: {...data,...commandData}
		}),
		contentType: "application/json; charset=UTF-8"
           });
	};

	self.buildMoveCommand = function(selected, move) {
           var commandUrl = (self.OctoPrint_CameraControl_profiles()[selected]['move_url'])();
	   var commandData = {}
           var panSpeedCommand = (self.OctoPrint_CameraControl_profiles()[selected]['panspeed_command'])();
           var tiltSpeedCommand = (self.OctoPrint_CameraControl_profiles()[selected]['tiltspeed_command'])();
           var speed = (self.OctoPrint_CameraControl_profiles()[selected]['speed'])();
           var moveCommand = (self.OctoPrint_CameraControl_profiles()[selected]['move_command'])();
	   commandData[panSpeedCommand] = speed;
           commandData[tiltSpeedCommand] = speed;
           commandData[moveCommand] = move;
	   return [commandUrl, commandData];
	};

	self.moveUp = function() {
	   var selected = self.chooseCamera();
           var up = (self.OctoPrint_CameraControl_profiles()[selected]['up'])();
	   var command = self.buildMoveCommand(selected, up);
	   self.sendCommand(selected, command[0], command[1]);
        };

        self.moveDown = function() {
	   var selected = self.chooseCamera();
           var down = (self.OctoPrint_CameraControl_profiles()[selected]['down'])();
	   var command = self.buildMoveCommand(selected, down);
	   self.sendCommand(selected, command[0], command[1]);
        };

        self.moveLeft = function() {
	   var selected = self.chooseCamera();
           var left = (self.OctoPrint_CameraControl_profiles()[selected]['left'])();
	   var command = self.buildMoveCommand(selected, left);
	   self.sendCommand(selected, command[0], command[1]);
        };

        self.moveRight = function() {
	   var selected = self.chooseCamera();
           var right = (self.OctoPrint_CameraControl_profiles()[selected]['right'])();
	   var command = self.buildMoveCommand(selected, right);
	   self.sendCommand(selected, command[0], command[1]);
        };

        self.buildSettings  = function() {
            var selected = $('#OctoPrint_CameraControlSelector')[0].selectedIndex;
            $('#camUrlInput').val((self.OctoPrint_CameraControl_profiles()[selected]['url'])());
            $('#userInput').val((self.OctoPrint_CameraControl_profiles()[selected]['user'])());
            $('#passwordInput').val((self.OctoPrint_CameraControl_profiles()[selected]['password'])());
            $('#mvCommandInput').val((self.OctoPrint_CameraControl_profiles()[selected]['move_command'])());
            $('#irCommandInput').val(( self.OctoPrint_CameraControl_profiles()[selected]['ir_command'])());
            $('#panSpeedCommandInput').val((self.OctoPrint_CameraControl_profiles()[selected]['panspeed_command'])());
            $('#tiltSpeedCommandInput').val((self.OctoPrint_CameraControl_profiles()[selected]['tiltspeed_command'])());
            $('#upInput').val((self.OctoPrint_CameraControl_profiles()[selected]['up'])());
            $('#downInput').val((self.OctoPrint_CameraControl_profiles()[selected]['down'])());
            $('#leftInput').val((self.OctoPrint_CameraControl_profiles()[selected]['left'])());
            $('#rightInput').val((self.OctoPrint_CameraControl_profiles()[selected]['right'])());
            $('#irOnInput').val((self.OctoPrint_CameraControl_profiles()[selected]['ir_on'])());
            $('#irOffInput').val((self.OctoPrint_CameraControl_profiles()[selected]['ir_off'])());
        };

        self.onAfterBinding = function() {
            var OctoPrint_CameraControl = $('#OctoPrint_CameraControl');
            var container = $('#control-jog-general');
            var cameraSettingsSelect = $('#OctoPrint_CameraControlSelector');

            OctoPrint_CameraControl.insertAfter(container);
            OctoPrint_CameraControl.css('display', '');

	    cameraSettingsSelect[0].onchange = self.buildSettings;
        };
    }

    OCTOPRINT_VIEWMODELS.push([
        OctoPrint_CameraControlViewModel,
        ["settingsViewModel", "controlViewModel"],
        ["#settings_plugin_OctoPrint_CameraControl_form","#OctoPrint_CameraControl"]
    ]);
});
