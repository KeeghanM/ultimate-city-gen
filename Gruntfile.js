module.exports = function (grunt) {
  grunt.initConfig({
    // define source files and their destinations
    uglify: {
      options: {
        mangle: false,
        compress: {},
      },
      files: {
        src: "jsm/main.js", // source files mask
        dest: "jsm/", // destination folder
        expand: true, // allow dynamic building
        flatten: true, // remove all unnecessary nesting
        ext: ".min.js", // replace .js to .min.js
      },
    },
    clean: {
      js: ["jsm/main.js"],
    },
    watch: {
      js: {
        files: ["js/**/*.js", "index.html"],
        tasks: ["clean", "concat", "uglify", "clean"],
      },
    },
    concat: {
      options: {
        separator: ";",
      },
      dist: {
        src: [
          "js/lib/globals.js",
          "js/lib/helpers.js",
          "js/lib/mouse_interaction.js",
          "js/lib/save_and_load.js",
          "js/lib/cute-alert-master/cute-alert.js",
          "js/components/building.js",
          "js/components/pane.js",
          "js/components/detailPanes.js",
          "js/generators/roadGenerator.js",
          "js/generators/buildingGenerator.js",
          "js/generators/names/districtNames.js",
          //   "js/generators/names/dwarfNames.js",
          //   "js/generators/names/elfNames.js",
          //   "js/generators/names/humanNames.js",
          //   "js/generators/names/jobs.js",
          "js/generators/names/townNames.js",
          "js/generators/names/typeLists.js",
          "js/sketch.js",
        ],
        dest: "jsm/main.js",
      },
    },
  })
  // load plugins
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-contrib-uglify")
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-clean")

  // register at least this one task
  grunt.registerTask("default", ["clean", "concat", "uglify", "clean"])
}
