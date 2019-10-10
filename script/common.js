var isProd = [true, false][0];

(function (window) {
    var template = function (str, options) {
        return str.replace(/\{\w+\}/g, function ($0) {
            return options[$0.replace(/\{|\}/g, '')];
        });
    };
    var isPhone = function (str) {
        return /^(0[1-9]{2}-?)?\d{8}$|^(0[1-9]{3}-?)?\d{7}$|^1\d{10}$/g.test(str);
    };
    var isIdcard = function (cid) {
        var arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        var arrValid = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        if (/^\d{17}\d|x$/i.test(cid)) {
            var sum = 0, idx;
            for (var i = 0; i < cid.length - 1; i++) {
                sum += parseInt(cid.substr(i, 1), 10) * arrExp[i];
            }
            idx = sum % 11;
            return arrValid[idx] === cid.substr(17, 1).toUpperCase();
        } else {
            return false;
        }
    };
    window.stringutil = {
        template: template,
        isIdcard: isIdcard,
        isPhone: isPhone
    };
})(window);

(function (window) {
    var split = function (array, length) {
        var result = [];
        while (array.length !== 0) {
            result.push(array.splice(0, length));
        }
        return result;
    };

    var numberArray = function (min, max) {
        return new Array(max - min + 1).fill(1).map(function (item, index) {
            return min + index
        });
    };

    window.arrayutil = {
        split: split,
        numberArray: numberArray
    };
})(window);

(function (window) {
    window.apputil = {
        objectKeys: Object.keys || function (object) {
            var keys = [];
            for (var o in object) {
                keys.push(o);
            }
            return keys;
        },

        objectValues: Object.values || function (object) {
            var values = [];
            for (var o in object) {
                values.push(object[o]);
            }
            return values;
        },

        debounce: (function () {
            var prevTime;
            return function (debounce, callback) {
                if (prevTime) {
                    if (new Date().getTime() - prevTime >= debounce) {
                        callback();
                        prevTime = null;
                    }
                } else {
                    prevTime = new Date().getTime();
                }
            };
        })(),

        isProd: function () {
            return isProd;
        },

        ready: function (callback) {
            if (this.isProd()) {
                window.apiready = callback;
            } else {
                $(callback);
            }
        },

        param: function (name) {
            if (this.isProd()) {
                return api.pageParam[name];
            } else {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = unescape(decodeURI(window.location.search.substr(1))).match(reg);
                if (r != null) return JSON.parse(r[2]);
                return null;
            }
        },

        fixStatusBar: function (name) {
            if (util.app.isProd()) {
                $api.fixStatusBar($api.byId(name));
            } else {
                var ele = $api.byId(name);
                ele.style.paddingTop = '0.16rem';
            }
        },

        appInstalled: function (bundle) {
            if (this.isProd()) {
                return api.appInstalled({sync: true, appBundle: bundle})
            }
        },

        openWindow: function (name, url, extra) {
            if (this.isProd()) {
                api.openWin({
                    name: name,
                    url: url,
                    reload: false,
                    delay: true,
                    pageParam: extra || {},
                    bgColor: '#F4F4F4'
                });
            } else {
                var params = [];
                for (var param in extra) {
                    params.push(param + '=' + JSON.stringify(extra[param]));
                }
                window.top.location.href = url + (params.length > 0 ? ('?' + encodeURI(escape(params.join('&')))) : '');
            }
        },

        closeWindow: function (name) {
            if (this.isProd()) {
                api.closeWin({name: name});
            } else {
                window.history.back();
            }
        },

        closeToWindow: function (name, url) {
            if (this.isProd()) {
                api.closeToWin({name: name});
            } else {
                window.top.location.href = url;
            }
        },

        openFrame: function (name, url, options, extra) {
            if (this.isProd()) {
                api.openFrame({
                    name: name,
                    url: url,
                    rect: {
                        x: options.x || 0,
                        y: options.y,
                        w: options.w || 'auto',
                        h: options.h || 'auto'
                    },
                    pageParam: extra || {},
                    bounces: false,
                    vScrollBarEnabled: true,
                    hScrollBarEnabled: false,
                    reload: true,
                    animation: {
                        type: 'none',
                        subType: 'from_right',
                        duration: 100
                    }
                });
            } else {
                var params = [];
                for (var param in extra) {
                    params.push(param + '=' + JSON.stringify(extra[param]));
                }
                var app = document.getElementById('app');
                var frame = document.createElement('iframe');
                var header = window.top.document.getElementById('header');
                var headerHeight = header ? parseFloat(getComputedStyle(header).height) : 0;
                var height = (parseFloat(getComputedStyle(app).height) - headerHeight) + 'px';
                frame.name = name;
                frame.style.width = '100%';
                frame.style.border = 'none';
                frame.style.height = height;
                frame.src = url + (params.length > 0 ? ('?' + encodeURI(escape(params.join('&')))) : '');
                app.append(frame);
                window.top.frame = frame;
            }
        },

        closeFrame: function (name) {
            if (this.isProd()) {
                api.closeFrame({name: name});
            }
        },

        emit: function (name, extra) {
            if (this.isProd()) {
                api.sendEvent({name: name, extra: extra});
            } else {
                // 只能在同一个页面有效
                window.top.postMessage({'event-name': name, extra: extra}, '*')
                if (window.top.frame) {
                    window.top.frame.contentWindow.postMessage({'event-name': name, extra: extra}, '*')
                }
            }
        },

        listen: function (name, resolve) {
            if (this.isProd()) {
                api.addEventListener({name: name}, function (ret) {
                    resolve && resolve.apply(null, [ret]);
                });
            } else {
                window.addEventListener('message', function (event) {
                    var data = event.data;
                    if (data['event-name'] === name) {
                        resolve && resolve.apply(null, [{value: data.extra}]);
                    }
                });
            }
        },

        toast: function (msg) {
            if (this.isProd()) {
                api.toast({msg: msg, duration: 2000, location: 'middle'});
            } else {
                console.info(msg);
            }
        },

        alert: function (title, msg) {
            if (this.isProd()) {
                api.alert({title: title, msg: msg});
            }
        },

        confirm: function (title, msg, submit, cancel) {
            if (this.isProd()) {
                api.confirm({title: title, msg: msg}, function (res) {
                    if (res.buttonIndex === 2) {
                        submit && submit();
                    } else {
                        cancel && cancel();
                    }
                });
            }
        },

        loading: function (text) {
            if (this.isProd()) {
                api.showProgress({
                    style: 'default',
                    animationType: 'fade',
                    title: '',
                    text: text || '',
                    modal: true
                });
            }
        },

        hideLoading: function () {
            if (this.isProd()) {
                api.hideProgress();
            }
        },
        calCourse: function (value) {
            var result = '';
            if (value > 345 || value < 15) {
                result = 'N';
            }
            if (value >= 15 && value <= 75) {
                result = 'NE';
            }
            if (value > 75 && value < 105) {
                result = 'E';
            }
            if (value >= 105 && value <= 165) {
                result = 'SE';
            }
            if (value > 165 && value < 195) {
                result = 'S';
            }
            if (value >= 195 && value <= 255) {
                result = 'SW';
            }
            if (value > 255 && value < 295) {
                result = 'W';
            }
            if (value >= 295 && value <= 345) {
                result = 'NW';
            }
            return result;
        }
    }
})(window);

(function (window) {
    var defaultFormat = 'yyyy-MM-dd HH:mm:ss';
    var _date = function (date) {
        return {
            'y+': date.getFullYear(),
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S+': date.getMilliseconds()
        };
    };
    var parse = function (dateString, format) {
        format = format || defaultFormat;
        var o = _date(new Date());
        for (var k in o) {
            var re = new RegExp(k);
            if (re.test(format)) {
                o[k] = (dateString + '').substr(re.exec(format).index, format.match(re).toString().length);
            }
        }
        return new Date(+o['y+'], +o['M+'] - 1, +o['d+'], +o['H+'], +o['m+'], +o['s+'], +o['S+']);
    };
    var format = function (date, fmt) {
        fmt = fmt || defaultFormat;
        date = new Date(date);
        var o = _date(date);
        var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + '']);
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    };
    var addDay = function (date, day) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + day);
    };
    var dayOfDate = function (date) {
        return date.getDay();
    };
    var firstOfMonth = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };
    var lastOfMonth = function (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    };
    var calendar = function (date, withTrail) {
        var firstDate = firstOfMonth(date);
        var lastDate = lastOfMonth(date);
        var firstDay = dayOfDate(firstDate);
        var daysOfMonth = lastDate.getDate() - firstDate.getDate() + 1;
        var length1 = firstDay + daysOfMonth - 1;
        var length2 = length1 % 7 !== 0 ? (length1 + (7 - (length1 % 7))) : length1;
        var array = new Array(length2);
        for (var index = 0; index < length2; index++) {
            var _date = null;
            var isBefore = index < firstDay;
            var isAfter = index > length1;
            var year = firstDate.getFullYear();
            var month = firstDate.getMonth();
            if (isBefore || isAfter) {
                if (withTrail) {
                    _date = isBefore ? new Date(year, month, index - firstDay + 1) : new Date(year, month + 1, index - length1);
                }
            } else {
                _date = new Date(year, month, firstDate.getDate() + index - firstDay);
            }
            if (_date) {
                array[index] = {
                    date: _date.getDate(),
                    currentMonth: !isBefore && !isAfter,
                    datestr: format(_date, 'yyyy-MM-dd')
                };
            }
        }
        return array;
    };


    var isLeapYear = function (year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    };

    var getMaxDates = function (years, months) {
        return months === 2 ? (util.date.isLeapYear(years) ? 29 : 28) : [1, 3, 5, 7, 8, 10, 12].indexOf(months) > -1 ? 31 : 30;
    };

    window.dateutil = {
        parse: parse,
        format: format,
        addDay: addDay,
        calendar: calendar,
        isLeapYear: isLeapYear,
        getMaxDates: getMaxDates
    }
})(window);

(function (window) {

    if (!apputil.isProd()) {
        window.document.addEventListener('keyup', function (event) {
            if (event.key === 'Escape') {
                window.top.history.back();
            }
        });
    }

    window.util = {
        app: apputil,
        date: dateutil,
        array: arrayutil,
        string: stringutil
    }
})(window);
