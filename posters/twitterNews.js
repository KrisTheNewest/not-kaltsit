
"use strict";

const { EmbedBuilder } = require("discord.js");
const { twitterFeed } = require("@kristhenewest/grab-data");

const token = require("../token.json");
const startUpDate = new Date(require("../time.json"));
const twitterHandles = require("../data/twitterHandles.js");

const handleDateMap = new Map();

const channels = [
	{ handle: "AKEndfield",   channels: ["1169935597801054218"] },
	{ handle: "AKEndfieldJP", channels: ["715985007637954592"]  },
	{ handle: "AKEndfieldKR", channels: ["1170676278798602250"] },
];

// placeholder function to simulate queries
async function queryDataBase(name) {
	return channels.find(({ handle }) => handle === name);
}

async function getNews(name, token) {
	return twitterFeed(name, token, startUpDate, handleDateMap).then(posts => {
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
		return newposts;
	});
}

module.exports = function pingTwitter(client) {
	// TODO: THIS REQUIRES REFACTOR!!
	twitterHandles.forEach(async (handle) => {
		const news = await getNews(handle, token);
		const { channels } = await queryDataBase(handle)
		channels.forEach(channelId => client.channels.fetch(channelId)
			.then(channel => {
				if (!channel.guild.available) return;
				// promise all helps with handling errors
				// its all asynchronous AND will stop the loop in case of error
				Promise.all(news.map(post => 
					channel.send(post)
				))
			})
		)
	})
}
