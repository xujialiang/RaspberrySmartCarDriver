// 在树莓派上，启动SmartCarDriver。 建议加入系统自启动。 需要用root权限，或者把pi用户加入到gpio用户组。

const ezPWM = require('ezpwmforraspberry');
const SBUSUART = require('sbusuart')
const SBUS = new SBUSUART();
const PWM = new ezPWM();

class SmartCarDriver {

    constructor(){
        // MC10遥控，行程最小200， 最大1800。
        SBUS.setupConvertParams(200, 1800);

        // 用12号端口控制速度
        PWM.openPWMByPercent(ezPWM.PWMPin.PIN12);
    }

    start(){
        SBUS.start('/dev/ttyAMA0', (status, channels, channels_c)=>{
            // 处理各个通道数据, 通过Promise异步处理
            // 通道1:右手左右;    控制左右方向
            // 通道2:左手上下;  
            // 通道3:右手上下;    油门 + -, 如果通道1有指令向左右，则按通道1方向。 如果通道1没有设置左右方向，则按默认向前或向后。
            // 通道4:左手左右;  
            // 通道5:SW1;       三段式开关
            // 通道6:SW2;       打开关闭小车动力，电机上电或关闭
            // 通道7:SW3;       打开关闭GPS
            // 通道8:SW4;       打开关闭啥？
            // 通道9:RV左;      云台左右
            // 通道10:RV右;     云台上下
            console.log('油门', status, channels[2], channels_c[2]);


        });
    }

}

new SmartCarDriver().start();