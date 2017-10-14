import feedparser from 'feedparser-promised';

const url = 'https://www.astronomie.info/news/rss-bulletin.xml';

module.exports = (event, context, callback) => {
    feedparser.parse(url).then((items) => {
        items.forEach(item => {
            callback(null, {
                uid: item.guid,
                updateDate: item.pubdate,
                titleText: item.title,
                mainText: item.description,
                redirectionUrl: item.link
            });        
        });
    });
};
