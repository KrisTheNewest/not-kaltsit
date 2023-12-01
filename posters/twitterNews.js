
"use strict";

const { EmbedBuilder } = require("discord.js");
const { twitterFeed } = require("@kristhenewest/grab-data");

const token = require("../token.json");
const startUpDate = new Date(require("../time.json"));
const handleDateMap = new Map();

module.exports = async function formatNews(channel) {
	return twitterFeed("ArknightsEN", token, startUpDate, handleDateMap).then(posts => {
		const newposts = posts
			.map(post => {
				const { name, handle, url, avatar, } = post.fullProfile;
				const { postUrl, postDate, postText, images, videoUrl, } = post;

				const msg = { content: postUrl, embeds: [] };

				const embed = new EmbedBuilder()
					.setAuthor({name: name + "@" + handle, iconURL: avatar, url})
					.setDescription(postText)
					.setColor("Blurple")
					.setTimestamp(new Date(postDate));
				msg.embeds.push(embed);

				if (!videoUrl) {
					const imageEmbeds = images.map(imgUrl => 
						new EmbedBuilder()
							.setColor("Blurple")
							.setImage(imgUrl)
							.setDescription(imgUrl)
					);
					msg.embeds.push(...imageEmbeds);
				}
				else {
					embed.setImage(images.at(0));
				}
				msg.embeds.at(-1)
					.setFooter({
						"text": "Twitter",
						iconURL: "https://media.discordapp.net/attachments/411849480455979008/774980312286756904/twitter.png"
					})
					.setTimestamp(new Date(postDate));

				return msg;
			});
		if (newposts.length) {
			Promise.all(newposts.map(msg => channel.send(msg)));
		}
	});
}
