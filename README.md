## 掘金库存监控
### 使用方式
- 青龙
```shell
ql repo https://github.com/iruochen/juejin_watch.git "juejin" "" "sendNotify" "js"
```
- 依赖安装
    - axios
    - dotenv
- 环境变量
```js
JUEJIN_WATCH  // 需要监控的物品名称, 多个用&连接
```