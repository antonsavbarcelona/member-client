{
  "selectedOption": "option-2",
  "options": {
    "option-1": {
      "description": "Hybrid: home + geo search via SSR, en-GB content via SSG",
      "ssr": ["/", "/home", "/geo-search", "/geo-search/(.*)"],
      "ssg": ["/en-GB/(.*)"]
    },
    "option-2": {
      "description": "All routes handled via SSR fallback",
      "ssr": ["/(.*)"],
      "ssg": []
    }
  }
}
