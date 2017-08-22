const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const flavors = config['flavors']
const lowerCaseFlavors = flavors.map(flavor => flavor.toLowerCase());

client.on('message', message => {
    if (message.content.startsWith(config['command'])) {
        let flavor = message.content.split(' ').slice(1);

        if (flavor.length < 1) {
            message.reply(config['specifyDistroReply']);
            return;
        } else if (flavor.length > 1) {
            message.reply(config['moreThenOneDistroReply']);
            return;
        }
        
        flavor = flavor[0];
        
        if (message.guild === undefined || !message.guild.available)
            return;

        const flavorIndex = lowerCaseFlavors.indexOf(flavor.toLowerCase());

        if (flavorIndex === -1) {
            message.reply(config['flavorDoesNotExistReply']);
            return;
        }
        
        // Flavor in the correct case
        const canonical_flavor = flavors[flavorIndex];
        const roles = message.guild.roles.array();
        const roleIndex = roles.map(role => role.name).indexOf(canonical_flavor);

        if (roleIndex === -1) {
            message.reply(config['roleDoesNotExistReply']);
            console.error('Flavor ' + canonical_flavor + ' is listed in the flavors section, but is not a role in the guild ' + message.guild.name);
            return;
        }

        // First, remove all other flavor roles
        message.member.roles.array().forEach(userRole => {
            if (userRole.name !== flavor && flavors.indexOf(userRole.name) > -1) {
                message.member.removeRole(userRole).catch(err => {
                    message.reply(config['internalErrorReply']);
                    console.error(err);
                });
            }
        });

        message.member.addRole(roles[roleIndex]).then(_ => {
            message.reply(config['doneReply']);
        }, err => {
            message.reply(config['internalErrorReply']);
            console.error(err);
        });
    }
});

client.login(config["token"]);
