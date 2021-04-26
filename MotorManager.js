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
        // 左前 向后 右前 向前
        // 左后 向前 右后 向后
        this.frontLeft.doBackward();
        this.frontRight.doForward();
        this.backLeft.doForward();
        this.backRight.doBackward();
    }

    // 麦克纳母轮
    doRight(){
        // 左前 向前 右前 向后
        // 左后 向后 右后 向前
        this.frontLeft.doForward();
        this.frontRight.doBackward();
        this.backLeft.doBackward();
        this.backRight.doForward();
    }

    // 麦克纳母轮 左转
    turnLeft(){
        // 左前 向后 右前 向前
        // 左后 向后 右后 向前
        this.frontLeft.doBackward();
        this.frontRight.doForward();
        this.backLeft.doBackward();
        this.backRight.doForward();
    }

    // 麦克纳母轮 右转
    turnRight(){
        // 左前 向前 右前 向后
        // 左后 向前 右后 向后
        this.frontLeft.doForward();
        this.frontRight.doBackward();
        this.backLeft.doForward();
        this.backRight.doBackward();
    }

    // 右前方
    doRightFront(){

    }

    // 右前方
    doLeftFront(){

    }

    // 右后方
    doRightBack(){

    }

    // 左后方
    doRightBack(){

    }
}

module.exports = MotorManager