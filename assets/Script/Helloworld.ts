/*
 * @Author: conjurer
 * @Github: https://github.com/dot123
 * @Date: 2019-12-07 16:11:31
 * @LastEditors: conjurer
 * @LastEditTime: 2019-12-07 16:43:18
 * @Description: 扇形射线检测
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    @property(cc.Graphics)
    private ctx: cc.Graphics = null;

    @property(cc.Node)
    private roleNode: cc.Node = null;

    private angle: number = 90; //检测前方角度范围[0,360]
    private distance: number = 280; //检测距离
    private rotatePerSecond: number = 90; //每秒旋转角度
    private accuracy: number = 10; //检测精度
    private hitResult: cc.PhysicsRayCastResult = null; //射线检测结果

    public onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = 0;
        cc.director.getPhysicsManager().gravity = cc.v2(0, 0);
    }

    /**
     * 画线
     * @param startPos
     * @param endPos
     * @param results
     */
    private DrawLine(startPos, endPos, results) {
        //画debug
        results.forEach(result => {
            this.ctx.circle(result.point.x, result.point.y, 5);
        });
        this.ctx.fill();
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
    }

    /**
     * 环顾四周
     * @param startPos
     * @param angle
     * @param distance
     */
    private LookAround(startPos: cc.Vec2, angle: number, distance: number) {
        let manager = cc.director.getPhysicsManager();
        let radian = cc.misc.degreesToRadians(angle);

        let c = Math.cos(radian);
        let s = Math.sin(radian);

        let x = distance * c;
        let y = distance * s;

        let endPos = cc.v2(x, y).addSelf(startPos);
        let results = manager.rayCast(startPos, endPos, cc.RayCastType.Any);

        let result = results[0];
        if (result) {
            endPos = result.point;
            this.hitResult = result; //检测结果
        }

        this.DrawLine(startPos, endPos, results);

        if (result) {
            //有结果则返回
            return true;
        }

        return false;
    }

    /**
     * 看
     * @param startPos
     * @param isReverse
     */
    private Look(startPos: cc.Vec2, isReverse: boolean) {
        let rotatePerSecond = this.rotatePerSecond;
        let subAngle = this.angle / this.accuracy; //每条射线需要检测的角度范围
        let angle = this.angle;
        if (isReverse) {
            subAngle = -subAngle;
            rotatePerSecond = -rotatePerSecond;
            angle = -angle + 360;
        }

        let count = cc.director.getTotalFrames();
        for (let i = 0; i < this.accuracy; i++) {
            if (this.LookAround(startPos, -angle / 2 + this.Repeat(rotatePerSecond * (1 / 60) * count, subAngle) + i * subAngle, this.distance)) {
                return true;
            }
        }

        return false;
    }

    public Repeat(t: number, length: number) {
        return cc.misc.clampf(t - Math.floor(t / length) * length, 0, length);
    }

    public update(dt) {
        this.ctx.clear();
        this.hitResult = null;
        this.Look(this.roleNode.parent.convertToWorldSpaceAR(this.roleNode.position), false);
    }
}
