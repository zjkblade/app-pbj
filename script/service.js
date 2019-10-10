// var prefix = 'http://192.168.1.20:20000';
var prefix = 'https://paobuji.91eqy.com:20001';

(function (window) {
    var getHeaders = function (url, headers) {
        headers = headers || {};
        if (url === '/auth/xzhAuth/login') {
            $api.clearStorage();
        } else {
            var token = $api.getStorage('TOKEN');
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
        }
        return headers;
    };

    var request = function (method, url, data, headers) {
        headers = getHeaders(url, headers);
        return new Promise(function (resolve, reject) {
            if (util.app.isProd()) {
                var options = {
                    method: method,
                    url: prefix + url,
                    timeout: 60,
                    cache: true,
                    headers: headers,
                    data: {body: data || {}}
                };
                api.ajax(options, function (res, err) {
                    util.app.hideLoading();
                    if (err) {
                        util.app.toast(err);
                        reject && reject();
                    } else {
                        if (res.code) {
                            if (res.code === 200) {
                                resolve(res.result);
                            } else if (res.code >= 400) {
                                util.app.toast(res.message || res.error);
                                reject && reject();
                                resolve(null);
                            }
                        } else {
                            resolve(res);
                        }
                    }
                });
            } else {
                $.ajax({
                    url: prefix + url,
                    type: method,
                    headers: headers,
                    contentType: headers['Content-Type'],
                    data: data && JSON.stringify(data) || null,
                    success: function (res) {
                        if (res.code) {
                            if (res.code === 200) {
                                resolve(res.result);
                            } else if (res.code >= 400) {
                                util.app.toast(res.message || res.error);
                                reject && reject();
                            }
                        } else {
                            resolve(res);
                        }
                    },
                    error: function (err) {
                        util.app.toast(err);
                        reject && reject();
                    }
                })
            }
        });
    };

    var upload = function (method, url, data, headers) {
        headers = getHeaders(url, headers);
        return new Promise(function (resolve) {
            var options = {
                method: method,
                url: prefix + url,
                timeout: 60,
                cache: true,
                headers: headers,
                data: {files: {file: data}}
            };
            api.ajax(options, function (res, err) {
                if (res && res.code === 200) {
                    resolve(res.message);
                } else {
                    util.app.toast(JSON.stringify(err));
                }
            });
        });
    };

    var get = function (url) {
        return request('get', url, null, {'Content-Type': 'application/json'});
    };
    var post = function (url, data) {
        return request('post', url, data, {'Content-Type': 'application/json'});
    };
    window.service = {
        get: get, post: post, upload: upload
    };
})(window);

(function (window) {
    window.apiservice = {
        login: function (data) {
            return service.post('/auth/xzhAuth/login', data)
        },
        // 获取注册验证码
        gensmscode: function (phoneNum) {
            return service.get('/system/smssetting/sendsms/' + phoneNum + '/稷集溯源')
        },
        // 注册
        register: function (data) {
            return service.post('/paobujims/wx/api/chickenfarm/register', data)
        },
        // 找回密码
        updatePassword: function (data) {
            return service.post('/paobujims/wx/api/messageUpdatePass', data)
        },
        // 获取登录用户
        getUser: function () {
            return service.get('/paobujims/wx/api/getLoginUser')
        },
        //添加设备
        addEquipment: function (data) {
            return service.post('/paobujims/acquisitionEquipment/save', data)
        },
        // 获取图片验证码
        verification: function () {
            return prefix + '/auth/xzhAuth/captcha?' + new Date().getTime();
        },
        // 获取设备详情
        getEquipment: function (id) {
            return service.get('/paobujims/acquisitionEquipment/findByOrgId/' + id)
        },
        //获取鸡环信息
        getCockRing: function (data) {
            return service.post('/paobujims/footringEquipment/pagelist', data)
        },
        // 获取员工详情
        getStaffMessage: function (userId) {
            return service.get('/paobujims/employeeinfo/findEmpByCfId/' + userId)
        },
        //员工状态开关
        changeState: function (data) {
            return service.post('/paobujims/employeeinfo/enableForbidden', data)
        },
        //保存员工信息
        saveSatae: function (data) {
            return service.post('/paobujims/employeeinfo/update', data)
        },
        //获取鸡场信息
        jichangxinxi: function (data) {
            return service.get('/paobujims/chickenfarminfo/get/' + data)
        },
        //鸡场摄像头
        jichangVideo: function (data) {
            return service.get('/paobujims/chickenFarmAndVideo/getVideoByChicken/' + data)
        },
        //修改密码
        xiugaimima: function (data) {
            return service.post('/paobujims/chickenfarminfo/updateMdPass', data)
        },
        // //录入鸡环信息
        luruxinxi: function (orgId, codeList) {
            return service.post('/paobujims/footringEquipment/saveFootCodeList', {orgId: orgId, codeList: codeList})
        },
        //获取鸡厂详情
        getChickenDetail: function (id) {
            return service.get('/paobujims/chickenfarminfo/get/' + id)
        },
        //保存鸡厂信息
        saveChicken: function (data) {
            return service.post('/paobujims/chickenfarminfo/update', data)
        },
        //保存图片
        uploadBanner: function (jichangID, banner) {
            return service.upload('post', `/paobujims/chickenfarminfo/uploadBanner/${jichangID}`, banner)
        },
        // //登录人员为员工
        // staff:function(id){
        //     return service.get('/paobujims/employeeinfo/get/{id}' + id)
        // },
        // //登录人员为鸡场
        // administration:function(id){
        //     return service.get('/paobujims/chickenfarminfo/get/{id}' + id)
        // },
    }
    ;
})(window);
