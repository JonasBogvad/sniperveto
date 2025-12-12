const PlatformIcon = ({ platform }) => {
    if (platform === 'twitch') return <span className="text-purple-400 font-bold text-sm">T</span>;
    if (platform === 'youtube') return <span className="text-red-500 font-bold text-sm">YT</span>;
    if (platform === 'kick') return <span className="text-green-400 font-bold text-sm">K</span>;
    return null;
};

export default PlatformIcon;
