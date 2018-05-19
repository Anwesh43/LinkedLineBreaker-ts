const w : number = window.innerWidth, h : number = window.innerHeight, LLB_NODES = 5
class LinkedLineBreakerStage {

    canvas : HTMLCanvasElement

    context : CanvasRenderingContext2D

    linkedLineBreaker : LinkedLineBreaker = new LinkedLineBreaker()

    animator : LLBAnimator = new LLBAnimator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.context.strokeStyle = '#311B92'
        this.context.lineCap = 'round'
        this.context.lineWidth = Math.min(w, h) / 50
        this.linkedLineBreaker.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedLineBreaker.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedLineBreaker.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage = new LinkedLineBreakerStage()
        stage.render()
        stage.handleTap()
    }
}

class LLBState {

    j : number = 0

    scales : Array<number> = [0, 0, 0]

    prevScale : number = 0

    dir : number = 0

    update(stopcb : Function) {
        this.scales[this.j] += 0.1 * this.dir
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.scales[this.j] = this.prevScale + this.dir
            this.dir = 0
            if (this.j == -1 || this.j == this.scales.length) {
                this.j -= this.dir
                this.dir = 0
                this.prevScale = this.scales[this.j]
                stopcb()
            }
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class LLBAnimator {

    animated : boolean = false

    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LLBNode {

    next : LLBNode

    prev : LLBNode

    state : LLBState = new LLBState()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < LLB_NODES - 1) {
            this.next = new LLBNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = (w / LLB_NODES)
        context.save()
        context.translate((this.i) * gap + gap/2 + gap * this.state.scales[1], h/2)
        for(var i = 0; i < 2; i++) {
            context.save()
            context.translate((1 - i) * gap/2, gap/2 * (this.state.scales[0]) * (1 - this.state.scales[2]) * (1 - 2 * i))
            context.beginPath()
            context.restore()
        }
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr : LLBNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedLineBreaker {

    curr : LLBNode = new LLBNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {

    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }

}
