package com.tourism.blog.controller;

import org.springframework.web.bind.annotation.GetMapping;          //metoda reaguje na http get zahtev
import org.springframework.web.bind.annotation.RestController;      //klasa prima web zahteve i vraca odgovore

@RestController
public class TestController {

    @GetMapping("/test")     //ako stigne get zahtev na /test, pozovi dole metodu
    public String test() {
        return "radi";
    }
}