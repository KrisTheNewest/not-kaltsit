
"use strict";

const { EmbedBuilder } = require("discord.js");
const { twitterFeed } = require("@kristhenewest/grab-data");

const token = require("../token.json");
const startUpDate = new Date(require("../logs/time.json"));
const twitterHandles = require("../data/twitterHandles.js");

const handleDateMap = new Map();

const TWITTERICON = "https://cdn.discordapp.com/attachments/411849480455979008/774980312286756904/twitter.png";
const TWITTERCOLOR = "#246BCE";

async function getNews(name, token) {
	return twitterFeed(name, token, startUpDate, handleDateMap).then(posts =>
		posts.map(({ fullProfile, ...post }) => {
			const { name, handle, url, avatar, } = fullProfile;
			const { postUrl, postDate, postText, images, videoUrl, } = post;

			const mainEmbed = new EmbedBuilder()
				.setColor(TWITTERCOLOR)
				.setAuthor({
					name: `${name} @${handle}`,
					url,
					iconURL: avatar,
				})
				.setDescription(postText ?? "...");

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
	).catch(err => console.error(err))
}

module.exports = async function pingTwitter(client, cache) {
	twitterHandles.forEach(async (handle) => {
		// errors are handled in the function
		const news = await getNews(handle, token);
		if (!news) return;

		// just in case the cache is missing a map of specific channels
		const channelIds = cache.get(handle) ?? [];
		channelIds.forEach(async id => {
			try {
				const discordChannel = await client.channels.fetch(id);
				// promise all "consolidates" errors
				await Promise.all(news.map((post) =>
					Promise.all(post.map((p) =>
						discordChannel.send(p)
					))
				));
			}
			catch ({ message, stack }) {
				// TODO: proper error handling
				console.log({ handle, id, message, stack });
			}
		})
	});
}
