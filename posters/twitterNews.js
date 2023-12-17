
"use strict";

const { EmbedBuilder } = require("discord.js");
const { twitterFeed } = require("@kristhenewest/grab-data");

const token = require("../token.json");
const startUpDate = new Date(require("../time.json"));
const twitterHandles = require("../data/twitterHandles.js");

const handleDateMap = new Map();

const TWITTERICON = "https://cdn.discordapp.com/attachments/411849480455979008/774980312286756904/twitter.png";
const TWITTERCOLOR = "#246BCE";
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
	return twitterFeed(name, token, startUpDate, handleDateMap).then(posts =>
		posts.map(post => {
			const { name, handle, url, avatar, } = post.fullProfile;
			const { postUrl, postDate, postText, images, videoUrl, } = post;

			const mainEmbed = new EmbedBuilder()
				.setColor(TWITTERCOLOR)
				.setAuthor({
					name: `${name} @${handle}`,
					url,
					iconURL: avatar,
				})
				.setDescription(postText);

			const footie = new EmbedBuilder()
				.setColor(TWITTERCOLOR)
				.setFooter({
					text: "Twitter",
					iconURL: TWITTERICON 
				})
				.setTimestamp(new Date(postDate));

			const allMsgs = [{ content: postUrl, embeds: [ mainEmbed ] }];

			if (!videoUrl) {
				const imageEmbeds = images.map(imgUrl => 
					new EmbedBuilder()
						.setColor(TWITTERCOLOR)
						.setImage(imgUrl)
						.setDescription(`[Open in browser...](${imgUrl})`)
				);
				allMsgs.at(0).embeds.push(...imageEmbeds, footie);
			}
			else {
				allMsgs.push(
					{ content: `[Open in browser...](${videoUrl})`}, 
					{ embeds: [ footie ] }
				)
			}
			return allMsgs;
		})
	);
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
					Promise.all(
						post.map((p) => channel.send(p))
					)
				))
			})
		)
	})
}
