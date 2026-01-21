/***************************************************
 * ESP8266 MakeCode Library - CORE FUNCTIONS
 ***************************************************/

namespace esp8266 {
    // ==================== SHARED VARIABLES ====================
    //% blockHidden=true
    export let esp8266Initialized = false
    //% blockHidden=true
    export let rxData = ""
    
    // ==================== CORE FUNCTIONS ====================
    // Internal error function
    function error(code: number): void {
        // debugging & LED dihilangkan
        // basic.showNumber(code)
    }

    //% blockHidden=true
    //% block="send AT command"
    export function sendCommand(
        command: string,
        expected: string = null,
        timeout: number = 1000
    ): boolean {
        rxData = ""
        serial.readString()
        serial.writeString(command + "\r\n")

        if (expected == null) return true

        let start = input.runningTime()
        while (input.runningTime() - start < timeout) {
            rxData += serial.readString()
            if (rxData.indexOf(expected) >= 0) return true
            if (rxData.indexOf("ERROR") >= 0) return false
            basic.pause(10)
        }
        return false
    }

    //% blockHidden=true
    //% block="get response"
    export function getResponse(terminator: string = "", timeout: number = 2000): string {
        let response = ""
        let start = input.runningTime()
        
        while (input.runningTime() - start < timeout) {
            response += serial.readString()
            if (terminator != "" && response.indexOf(terminator) >= 0) {
                return response
            }
            basic.pause(50)
        }
        return response
    }

    //% blockHidden=true
    //% block="is WiFi connected"
    export function isWifiConnected(): boolean {
        return sendCommand("AT+CWJAP?", "WIFI GOT IP", 1000)
    }

    // ==================== PUBLIC API - INITIALIZATION ====================
    //% weight=100
    //% block="initialize ESP8266|Tx %tx Rx %rx Baud %baudrate"
    //% tx.defl=SerialPin.P0
    //% rx.defl=SerialPin.P1
    //% baudrate.defl=BaudRate.BaudRate115200
    export function init(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): void {
        serial.redirect(tx, rx, baudrate)
        basic.pause(1000)

        if (!sendCommand("AT+RST", "ready", 5000)) {
            error(1)
            return
        }
        
        if (!sendCommand("ATE0", "OK", 2000)) {
            error(2)
            return
        }
        
        if (!sendCommand("AT+CWMODE=1", "OK", 2000)) {
            error(3)
            return
        }

        esp8266Initialized = true
    }

    // ==================== EXPORT OTHER MODULES ====================
    // Import and export HTTP functions
    export * from "./http"
    
    // Import and export Firebase functions
    export * from "./firebase"
}
