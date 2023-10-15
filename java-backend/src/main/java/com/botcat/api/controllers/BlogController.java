package com.botcat.api.controllers;

import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BlogController {
  
  @GetMapping("/blog")
  public String blogMain(Model model) {
    model.addAttribute("title", "Blog");
    
    return "blog";
  }
}
