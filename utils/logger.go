package utils

import (
	"fmt"
	"time"
)

func Log(level string, message string) {
	fmt.Printf("[%s] [%s] : %s\n", time.Now().Format("02.01.2006 - 15:04:05"), level, message)
}

func Error(message string) {
	Log("ERROR", message)
}

func Info(message string) {
	Log("INFO", message)
}
