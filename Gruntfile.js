module.exports = function (grunt) {
  grunt.initConfig({
    watch: {
      dev: {
        files: ["js/**/*.js", "index.html"],
        tasks: ["clean", "concat", "copy"],
      },
    },
    clean: {
      js: ["dist/*"],
    },
    copy: {
      alert: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ["js/lib/alert/img/*"],
            dest: "dist/img/",
          },
        ],
      },
      html_css: {
        files: [{ src: ["index.html", "style.css"], dest: "dist/" }],
      },
    },
    uglify: {
      options: {
        mangle: false,
        compress: {},
      },
      files: {
        src: "dist/*.js", // source files mask
        dest: "dist/", // destination folder
        expand: true, // allow dynamic building
        flatten: true, // remove all unnecessary nesting
        ext: ".min.js", // replace .js to .min.js
      },
    },
    concat: {
      app: {
        options: {
          separator: ";",
        },
        src: [
          "js/lib/globals.js",
          "js/components/building.js",
          "js/components/pane.js",
          "js/components/detailPanes.js",
          "js/lib/helpers.js",
          "js/lib/mouse_interaction.js",
          "js/lib/save_and_load.js",
          "js/lib/alert/alert.js",
          "js/generators/roadGenerator.js",
          "js/generators/buildingGenerator.js",
          "js/generators/names/districtNames.js",
          "js/generators/names/dwarfNames.js",
          "js/generators/names/elfNames.js",
          "js/generators/names/humanNames.js",
          "js/generators/names/jobs.js",
          "js/generators/names/townNames.js",
          "js/generators/names/typeLists.js",
          "js/sketch.js",
        ],
        dest: "dist/main.js",
      },
      css: {
        src: ["css/style.css", "lib/alert/style.css"],
        dest: "dist/style.css",
      },
    },
  })
  // load plugins
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-contrib-uglify")
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-contrib-clean")
  grunt.loadNpmTasks("grunt-contrib-copy")

  // register at least this one task
  grunt.registerTask("dev", ["clean", "concat", "copy"])
  grunt.registerTask("live", ["clean", "concat", "uglify", "copy"])
}
