var filters = {
    datetime: function (value) {
        return util.date.format(value);
    },
    date: function (value) {
        return util.date.format(value, 'yyyy-MM-dd');
    },
    time: function (value) {
        return util.date.format(value, 'HH:mm:ss');
    },
    duration: function (value) {
        var days = Math.floor(value / (24 * 3600000));
        var hours = Math.floor((value % (24 * 3600000)) / 3600000);
        var minute = Math.floor((value % 3600000) / 60000);
        var seconds = Math.floor((value % 60000) / 1000);
        var result = [seconds + '秒'];
        if (minute) {
            result.unshift(minute + '分')
        }
        if (hours) {
            result.unshift(hours + '小时')
        }
        if (days) {
            result.unshift(days + '天')
        }
        return result.join('');
    },
    fixed: function (value, fixed) {
        return (+value).toFixed(fixed || 6);
    },
    gotsrc: function (value) {
        return {
            'Unknown': '未知',
            'cell': '基站',
            'gps': '卫星',
            'wifi': 'WIFI'
        }[value];
    },
    course: function (value) {
        return {
            'N': '正北',
            'NE': '东北',
            'E': '正东',
            'SE': '东南',
            'S': '正南',
            'SW': '西南',
            'NW': '西北',
            'W': '正西'
        }[util.app.calCourse(value)];
    },
    speed: function (value) {
        return (value / 1000).toFixed(2) + 'km/h';
    },
    distance: function (value) {
        return (value / 1000).toFixed(3) + 'km';
    }
};
