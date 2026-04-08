package main

/* NOTE
Ovo je test API servisa za proveru funkcionalnosti Gateway-a
*/

import (
	// Util
	"log"
	"net/http"

	// REST API
	"github.com/gin-gonic/gin"
)

type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

var albums = []album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func getAlbums(c *gin.Context) {
	c.JSON(http.StatusOK, albums)
}

func main() {
	router := gin.Default()

	router.GET("/albums", getAlbums)
	log.Println("Starting server on :8081")

	// Ovde moramo koristiti :8081 umesto localhost:8081
	router.Run(":8081")
}
