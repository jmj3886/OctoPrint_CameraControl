# coding=utf-8
from __future__ import absolute_import
import flask
import requests
import json
import re
import octoprint.plugin
import octoprint.settings

class OctoPrint_CameraControlPlugin(octoprint.plugin.StartupPlugin,
                      octoprint.plugin.TemplatePlugin,
                      octoprint.plugin.SettingsPlugin,
                      octoprint.plugin.AssetPlugin,
                      octoprint.plugin.SimpleApiPlugin):

    def get_assets(self):
        return dict(
            js=["js/OctoPrint_CameraControl.js"],
        )

    def on_after_startup(self):
        self._logger.info("OctoPrint_CameraControl Loaded! (more: %s)" % self._settings.get(["OctoPrint_CameraControl_profiles"]))

    def get_settings_version(self):
        return 1

    def on_settings_migrate(self, target, current=None):
        if current is None or current < self.get_settings_version():
            self._logger.debug("Settings Migration Needed! Resetting to defaults!")
            # Reset plug settings to defaults.
            self._settings.set(['OctoPrint_CameraControl_profiles'], self.get_settings_defaults()["OctoPrint_CameraControl_profiles"])

    def get_settings_defaults(self):
        profiles = []
        webcams = list(octoprint.settings.settings().get(["plugins","multicam","multicam_profiles"]))
        if len(webcams) > 0:
            index = 0
            for camera in webcams:
                url_regex = '(?:http.*://)?(?P<host>[^:/ ]+).?(?P<port>[0-9]*).*'
                m = re.search(url_regex, camera['URL'])
                camera_url = str(m.group('host'))+":"+str(m.group('port'))
                profiles.append({'name':camera['name'],'url':camera_url,'user':"admin",'password':"Password",'tiltspeed_command':"TiltSingleMoveDegree",'panspeed_command':"PanSingleMoveDegree",'speed':20,'move_url':"/pantiltcontrol.cgi",'move_command':"PanTiltSingleMove",'up':"1",'down':"7",'left':"3",'right':"5",'ir_url':"/nightmodecontrol.cgi",'ir_command':"IRLed",'ir_on':"1",'ir_off':"0"})
        else:
            url_regex = '(?:http.*://)?(?P<host>[^:/ ]+).?(?P<port>[0-9]*).*'
            m = re.search(url_regex,octoprint.settings.settings().get(["webcam","stream"]))
            camera_url = str(m.group('host'))+":"+str(m.group('port'))
            profiles.append({'name':"Default",'url':camera_url,'user':"admin",'password':"Password",'tiltspeed_command':"TiltSingleMoveDegree",'panspeed_command':"PanSingleMoveDegree",'speed':20,'move_url':"/pantiltcontrol.cgi",'move_command':"PanTiltSingleMove",'up':"1",'down':"7",'left':"3",'right':"5",'ir_url':"/nightmodecontrol.cgi",'ir_command':"IRLed",'ir_on':"1",'ir_off':"0"})
        return dict(OctoPrint_CameraControl_profiles=profiles)

    def get_template_configs(self):
        return [
            dict(type="settings", custom_bindings=True),
            dict(type="generic", template="OctoPrint_CameraControl.jinja2", custom_bindings=True)
        ]

    def get_api_commands(self):
        return dict(sendCommand=["url","commandData"])

    def on_api_command(self, command, data):
        self._logger.info("Command - "+command);
        if command == "sendCommand":
	    commandData = json.dumps(data['commandData'])
            self._logger.info("URL - "+data['url'])
            self._logger.info("Data - "+commandData)
#            ret = requests.post(data['url'], data=commandData, auth=(commandData.user, commandData.password))
#            self._logger.info(ret.json())

    ##~~ Softwareupdate hook
    def get_version(self):
        return self._plugin_version

    def get_update_information(self):
        return dict(
            OctoPrint_CameraControl=dict(
                displayName="OctoPrint_CameraControl",
                displayVersion=self._plugin_version,

                # version check: github repository
                type="github_release",
                user="jmj3886",
                repo="OctoPrint_CameraControl",
                current=self._plugin_version,

                # update method: pip
                pip="https://github.com/jmj3886/OctoPrint_CameraControl/archive/{target_version}.zip"
            )
        )

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = OctoPrint_CameraControlPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }

