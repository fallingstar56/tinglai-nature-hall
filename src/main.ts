// 浏览器入口文件，等待 DOM 就绪后把 Phaser 自然大厅挂载到页面容器。
import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

});
