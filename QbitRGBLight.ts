/**
 * QbitRGBLight package
 */

enum QbitRGBColors {
    //% block=red
    Red = 1,
    //% block=orange
    Orange = 2,
    //% block=yellow
    Yellow = 3,
    //% block=green
    Green = 4,
    //% block=blue
    Blue = 5,
    //% block=indigo
    Indigo = 6,
    //% block=violet
    Violet = 7,
    //% block=purple
    Purple = 8,
    //% block=white
    White = 9
}

 enum Lights {
    //% block="Light 1"
    Light1 = 0x00,
    //% block="Light 2"
    Light2 = 0x01,
    //% block="Light 3"
    Light3 = 0x02,
    //% block="Light 4"
    Light4 = 0x03
}

/**
 * Different modes for RGB or RGB+W RGBLight QbitRGBColors
 */
enum QbitRGBPixelMode {
    //% block="RGB (GRB format)"
    RGB = 0,
    //% block="RGB+W"
    RGBW = 1,
    //% block="RGB (RGB format)"
    RGB_RGB = 2
}

/**
 * QbitRGBLight Functions
 */
namespace QbitRGBLight {
    //% shim=sendBufferAsm
    //% parts="QbitRGBLight"
    function sendBuffer(buf: Buffer, pin: DigitalPin) {

    }

    /**
    * A LHQbitRGBLight class
    */
    export class LHQbitRGBLight {
        buf: Buffer;
        pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        _mode: QbitRGBPixelMode;

        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);
            // don't yield to avoid races on initialization
        }

        setPixelColor(pixeloffset: number, rgb: QbitRGBColors, flag: boolean): void {
            this.setPixelRGB(pixeloffset, rgb, flag);
        }

        private setPixelRGB(pixeloffset: number, rgb: QbitRGBColors, flag: boolean): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;
            let tureRgb = 0;
        
            if ((pixeloffset == 2 || pixeloffset == 3)&&!flag)
            {
                switch (rgb)
                {
                    case QbitRGBColors.Red:
                        tureRgb = 0x00FF00;
                        break;    
    
                    case QbitRGBColors.Orange:
                        tureRgb = 0xF6BA41;    
                        break;    
    
                    case QbitRGBColors.Yellow:
                        tureRgb = 0xFFFF00;
                        break;    
                        
                    case QbitRGBColors.Green:
                        tureRgb = 0xFF0000;    
                        break;    
    
                    case QbitRGBColors.Blue:
                        tureRgb = 0x0000FF;
                        break;    
                        
                    case QbitRGBColors.Indigo:
                        tureRgb = 0x004b82;    
                        break;    
    
                    case QbitRGBColors.Violet:
                        tureRgb = 0x2B8AE2;
                        break;    
                        
                    case QbitRGBColors.Purple:
                        tureRgb = 0x00FFFF;    
                        break;   
    
                    case QbitRGBColors.White:
                        tureRgb = 0xFFFFFF;    
                        break;   
                }
            }
            else
            {
                switch (rgb)
                {
                    case QbitRGBColors.Red:
                        tureRgb = 0xFF0000;
                        break;    
    
                    case QbitRGBColors.Orange:
                        tureRgb = 0xFFA500;    
                        break;    
    
                    case QbitRGBColors.Yellow:
                        tureRgb = 0xFFFF00;
                        break;    
                        
                    case QbitRGBColors.Green:
                        tureRgb = 0x00FF00;    
                        break;    
    
                    case QbitRGBColors.Blue:
                        tureRgb = 0x0000FF;
                        break;    
                        
                    case QbitRGBColors.Indigo:
                        tureRgb = 0x4b0082;    
                        break;    
    
                    case QbitRGBColors.Violet:
                        tureRgb = 0x8a2be2;
                        break;    
                        
                    case QbitRGBColors.Purple:
                        tureRgb = 0xFF00FF;    
                        break;   
    
                    case QbitRGBColors.White:
                        tureRgb = 0xFFFFFF;    
                        break;   
                }
       
            }

            let stride = this._mode === QbitRGBPixelMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(tureRgb);
            let green = unpackG(tureRgb);
            let blue = unpackB(tureRgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === QbitRGBPixelMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        show() {
            sendBuffer(this.buf, this.pin);
        }

        clear(): void {
            const stride = this._mode === QbitRGBPixelMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
            this.show();
        }
    }
    export function create(pin: DigitalPin, numleds: number, mode: QbitRGBPixelMode): LHQbitRGBLight {
        let light = new LHQbitRGBLight();
        let stride = mode === QbitRGBPixelMode.RGBW ? 4 : 3;
        light.buf = pins.createBuffer(numleds * stride);
        light.start = 0;
        light._length = numleds;
        light._mode = mode;
        light.setBrightness(255);
        light.setPin(pin);
        return light;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
}
