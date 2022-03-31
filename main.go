package main

import (
	Boot "github.com/alexpresso/judy/bootstrap"
	"github.com/spf13/viper"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func init() {
	viper.SetConfigFile("config.json")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	sess := Boot.InitializeBot()
	Boot.RegisterCommands(sess)

	defer func() {
		sc := make(chan os.Signal, 1)
		signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
		<-sc
	}()
}
