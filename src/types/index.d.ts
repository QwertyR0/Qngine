// WIP

import { Sdl } from "@kmamal/sdl"
import canvas from "canvas"

interface JoystickEvents {
    // TODO: Implement axis, ball, button types
    
    axisMotion: (axis: any, val: number) => void
    buttonDown: (button: any) => void
    buttonUp: (button: any) => void
    close: () => void
    ballMotion: (ball: any, x: number, y: number) => void
}

interface io {
    isKeyDown(key: string): boolean
    isKeyUp(key: string): boolean
    isMouseDown(button: number): boolean
    isMouseUp(button: number): boolean
    getMousePos(): Sdl.Mouse.Module["position"] | {x: number, y: number} // return directly from @kmamal/sdl
    playSound(soundPath: string, volume: number): void
}

type GraphicDrawType = "fill" | "border"; 

export namespace Qngine {

    interface Window {
        readonly width: number
        readonly height: number

        /**
         * SpriteSheet Class
        */
        SpriteSheet:typeof SpriteSheet
        GameObject:typeof GameObject

        /**
         * creates an animation child
        */
        newAnimation(SpriteSheet: SpriteSheet, frameDuration:number, anim?:Array<number>, options?: {
            maxFrame?: number,
            flipArray?: boolean
        }): Animation

        /**
         * border state of the window
        */
        borderless: boolean
        // readonly io

        /** 
         * exits the window
        */
        exit(): void

        /** 
         * minimizes the window
        */
        minimize(): void
        
        /** 
         * maximizes the window
        */
        maximize(): void

        /**
         * sets the border state of the window
        */
        setBorderless(set: boolean): void

        /**
         * sets the position of the window
        */
        setPos(x: number, y: number): void

        /**
         * returns the position of the window
        */
        getPos(): {x: number, y: number}

        /**
         * sets the title of the window
        */
        setTitle(title: string): void

        /**
         * loads an image
        */
        loadImage(imagePath: string): Promise<ImageInstance>

        /**
         * Creates a new Joystick Instance
         * 
         * ! NOT STABLE !
        */

        initJoystick(id: number, options?: JoystickEvents): Joystick | boolean

        io: io
    }

    interface Graphics {
        line(fx: number, fy: number, nx: number, ny: number, color?: string, width?: number): void
        rectangle(type: GraphicDrawType, fx: number, fy: number, nx: number, ny: number, color?: string, options?: {
            borderWidth?: number,
            rotation?: number
        }): void
        circle(type: GraphicDrawType, fx: number, fy: number, radius: number, color?: string): void
        text(text: string, fx: number, fy: number, options?: {
            font?: string
            scale?: number
            italic?: boolean
            bold?: boolean
            align?: string
            color?: string
            style?: GraphicDrawType
        }): void
        image(image: ImageInstance, fx: number, fy: number, options?: {
            scaleX?: number,
            scaleY?: number,
            flipX?: boolean,
            flipY?: boolean,
            rotation?: number
        }): void

        ctx: canvas.CanvasRenderingContext2D
    }

    class SpriteSheet {
        public flipX: boolean
        public flipY: boolean
        public currentFrame: number

        constructor(
            image: ImageInstance,
            width: number,
            height: number,
            cols: number,
            rows: number,
            totalSprites: number,
            options?: {
                scale?: number
            }
        )

        setFrame(frame: number): void
        draw(x: number, y: number, options?: {
            flipX?: boolean,
            flipY?: boolean,
            rotation?: number
        }): void
        getFrame(): number
    }

    class Animation {
        public isPlaying: boolean
        public frameDuration: number
        readonly currentFrameIndex: number
        readonly elapsedTime: number
        readonly cylceIndex: number
        
        constructor(
            image: ImageInstance,
            width: number,
            height: number,
            cols: number,
            rows: number,
            totalSprites: number,
            options?: {
                maxFrame?: number,
                flipArray?: boolean
            }
        )

        play(): void
        stop(): void
        pause(): void
        update(dt: number): void
    }

    class GameObject {
        public willRender: boolean
        public x: number
        public y: number
        public z: number
        public width: number
        public height: number
        public rot: number
        
        constructor(
            x: number,
            y: number,
            z: number,
            width: number,
            height: number,
            rot: number,
            options?: {
                update?: (w: Window, dt: number, pluginInterface: object) => void,
                render?: (w: Window, graphics: Graphics/* graphics */, pluginInterface: object /* graphics */ ) => void
            }
        )
        
        remove(): void
        hide(): void
        show(): void
        static RemoveAll(): void
    }

    interface ImageInstance{
        Image: canvas.Image,
        width: number,
        height: number
    }

    interface Joystick {
        id: number
        controller: Sdl.Joystick.JoystickInstance
        events: JoystickEvents
        led: boolean
        rumble: boolean
    }
}

export interface PluginKit {
    callEvent(evenToCall: string, ...eventArgs: any[]): void
    createSharedVar(id: any, val: any): boolean
    getSharedVar(id: any): boolean | any
    editSharedVar(id: any, val: any): boolean
}
