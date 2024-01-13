import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
    data() {
        return {
            pathname: window.location.pathname, //當前路徑
            hasCookie: document.cookie.includes('mycookieTest'), //是否有cookie
            userInfo: { //帳號密碼
                username: '',
                password: '',
            },
            userLogin: false, //是否登入
            userChoose: {}, //品項選擇
            putChoose: {}, //品項編輯
            products: [], //全部品項,
            addProduct: { //新增
                data: {
                    "title": "",
                    "category": "",
                    "origin_price": "",
                    "price": "",
                    "unit": "個",
                    "description": "",
                    "content": "",
                    "is_enabled": 0,
                    "imageUrl": "",
                    "imagesUrl": []
                }
            }
        }
    },
    created() {
        if (this.pathname === '/2023VUE_HW3/admin.html' && this.hasCookie === false) {
            location.href = 'index.html';
        }
        if (this.hasCookie === true) {
            axios.defaults.headers.common['Authorization'] = document.cookie.replace(
                /(?:(?:^|.*;\s*)mycookieTest\s*\=\s*([^;]*).*$)|^.*$/,
                "$1",
            ); //意思是下次發axios請求時，會把token以headers一起發送。
            this.render();
        }
    },
    methods: {
        del(id) {
            axios
                .delete(`https://ec-course-api.hexschool.io/v2/api/joooker/admin/product/${id}`)
                .then((res) => {
                    if (res.data.success) {
                        this.hasCookie = res.data.success;
                        this.render();
                        alert('已刪除');
                    }
                }).catch((error) => {
                    console.log(error);
                })
        },
        put() {
            console.log(this.putChoose);
            axios
                .put(`https://ec-course-api.hexschool.io/v2/api/joooker/admin/product/${this.putChoose.id}`, {
                    data: {...this.putChoose}
                })
                .then((res) => {
                    if (res.data.success) {
                        this.hasCookie = res.data.success;
                        this.render();
                        alert('已更改');
                    }
                }).catch((error) => {
                    console.log(error);
                })
        },
        editChoose(item){
            this.putChoose = {...item};
        },
        post() {
            this.pushImage();
            console.log(this.addProduct.data);
            axios
                .post('https://ec-course-api.hexschool.io/v2/api/joooker/admin/product', {
                    ...this.addProduct
                })
                .then((res) => {
                    if (res.data.success) {
                        this.hasCookie = res.data.success;
                        this.render();
                        this.reset();
                        alert('已新增');

                    }
                }).catch((error) => {
                    console.log(error);
                })
        },
        pushImage() {
            if (this.addProduct.data.imagesUrl.length === 5) return;
            let math = Math.floor(Math.random() * 50) + 1;
            for (let i = 1; i <= 5; i++) {
                this.addProduct.data.imagesUrl.push(`https://picsum.photos/id/${math + 5 * i}/500/300`)
            }
            this.addProduct.data.imageUrl = `https://picsum.photos/id/${math}/500/300`
        },
        login() {
            axios
                .post('https://ec-course-api.hexschool.io/v2/admin/signin', this.userInfo)
                .then((res) => {
                    let { token, expired } = res.data;
                    this.userLogin = res.data.success;
                    this.hasCookie = true;
                    document.cookie = `mycookieTest=${token};expires=${new Date(expired)};`;
                    token = document.cookie.replace(
                        /(?:(?:^|.*;\s*)mycookieTest\s*\=\s*([^;]*).*$)|^.*$/,
                        "$1",
                    );
                    axios.defaults.headers.common['Authorization'] = token; //意思是下次發axios請求時，會把token以headers一起發送。
                    console.log(axios.defaults.headers.common['Authorization']);
                    location.href = 'admin.html';
                }).catch((error) => {
                    console.log(error);
                })

        },
        checkLogin() {
            // #3 取得 Token（Token 僅需要設定一次）
            if (document.cookie.includes('mycookieTest') === false) {
                alert('未驗證');
                return
            }

            axios
                .post('https://ec-course-api.hexschool.io/v2/api/user/check')
                .then((res) => {
                    if (res.data.success) {
                        this.hasCookie = res.data.success;
                        alert('已驗證');
                    }
                }).catch((error) => {
                    console.log(error);
                })
        },
        detail(item) {
            this.userChoose = {...item};
        },
        render() {
            axios
                .get('https://ec-course-api.hexschool.io/v2/api/joooker/admin/products')
                .then((res) => {
                    this.products = res.data.products;
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        reset() {
            this.addProduct.data = {
                "title": "",
                "category": "",
                "origin_price": "",
                "price": "",
                "unit": "個",
                "description": "",
                "content": "",
                "is_enabled": 0,
                "imageUrl": "",
                "imagesUrl": []
            }
        },
    },

    computed: {
        chooseIsNull() {
            return Object.keys(this.userChoose).length !== 0;
        },
        putChooseIsNull() {
            return Object.keys(this.putChoose).length !== 0;
        },
        isDisabled() {
            return (
                this.addProduct.data.title === "" ||
                this.addProduct.data.category === "" ||
                this.addProduct.data.origin_price === "" ||
                this.addProduct.data.price === "" ||
                this.addProduct.data.description === "" ||
                this.addProduct.data.content === "" ||
                this.addProduct.data.imageUrl === "" ||
                this.addProduct.data.imagesUrl.length === 0
            ) ?
                true : false;
        },
        putIs_enabled:{
            //因為API格式規定is_enabled接受0跟1，
            //而type="checkbox"用v-model控制時會傳回boolen
            //所以利用computed
            set(value) {
                this.putChoose.is_enabled = value ? 1 : 0;
            },
            get() {
                return this.putChoose.is_enabled === 0 ? false : true;
            }
        },
        changeIs_enabled: {
            //因為API格式規定is_enabled接受0跟1，
            //而type="checkbox"用v-model控制時會傳回boolen
            //所以利用computed
            set(value) {
                this.addProduct.data.is_enabled = value ? 1 : 0;
            },
            get() {
                return this.addProduct.data.is_enabled === 0 ? false : true;
            }
        }
    }
}).mount('#app');