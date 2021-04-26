const ezTB6612 = require('eztb6612')
const ezPWM = require('ezpwmforraspberry');

class MotorManager{

    motorFactory(motorpin1,motorpin2,motorpwm){
        let motor = new ezTB6612(motorpin1, motorpin2, motorpwm);
        console.log('MotorManager-motorFactory', motor);
        return motor.getAllMotors()[0];
    }

    setupMotors(frontLeft, frontRight, backLeft, backRight){
        this.frontLeft = frontLeft;
        this.frontRight = frontRight;
        this.backLeft = backLeft;
        this.backRight = backRight;
    }

    getAllMotors(){
        return [this.frontLeft, this.frontRight, this.backLeft, this.backRight]
    }

    updateSpeed(percent, motor){
        if(motor){
            motor.updateMotorSpeed(percent);
        }else{
            this.frontLeft.updateMotorSpeed(percent);
            this.frontRight.updateMotorSpeed(percent);
            this.backLeft.updateMotorSpeed(percent);
            this.backRight.updateMotorSpeed(percent);
        }
    }

    // 向前
    doForward(motor){
        if(motor){
            motor.doForward();
        }else{
            this.frontLeft.doForward();
            this.frontRight.doForward();
            this.backLeft.doForward();
            this.backRight.doForward();
        }
    }

    // 向后
    doBackward(motor){
        if(motor){
            motor.doBackward();
        }else{
            this.frontLeft.doBackward();
            this.frontRight.doBackward();
            this.backLeft.doBackward();
            this.backRight.doBackward();
        }
    }

    // 麦克纳母轮
    doLeft(){

    }

    // 麦克纳母轮
    doRight(){

    }

    // 麦克纳母轮 左转
    turnLeft(){

    }

    // 麦克纳母轮 右转
    turnRight(){

    }
}

module.exports = MotorManager