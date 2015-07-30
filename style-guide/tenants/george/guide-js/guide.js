define([
  "jquery",
  "modernizr",
  "common/checked-option-style",
  "common/progress-btn",
  "common/plugins/chooser"
], function ($, Modernizr, checkedOptionStyle, progressBtn) {

  var exports = {

    init: function () {
      $(".js-chooser-example").chooser();

      $(".js-nav-toggle").on("click", function (ev) {
        ev.stopPropagation();

        $("body").toggleClass("is-navigable");
      });

      $(".js-code-toggle").on("click", function () {
        $(this).closest(".guide-code-expander").toggleClass("is-expanded");
      });

      $(".guide-content, .guide-header").on("click", function () {
        $("body").removeClass("is-navigable");
      });

      $(".guide-nav-item > a").click(function () {
        var isActive = $(this).next("ul").hasClass("active");

        $(".guide-subnav-list").removeClass("active").slideUp("fast");

        if (!isActive) {
          $(this).next("ul").addClass("active").slideDown("fast");
        }
      });

      var toggleProgressBtn = function ($markupSection) {
        var $button = $markupSection.find(".btn");
          $toggle = $markupSection.find(".guide-example-demo-button");

        if ($button.hasClass("btn-progress")) {
          progressBtn.deactivate($button);
          $toggle.addClass("hide-content");

          return;
        }

        $toggle.removeClass("hide-content");
        progressBtn.activate($button);
      };

      $("#example-progress-buttons")
        .find(".guide-example-demo-button, .btn-progress")
        .on("click", function () {
          toggleProgressBtn($(this).closest(".guide-example-markup"));
      });

      $(".guide-example-markup").on("click", "a, button", function (ev) {
        ev.preventDefault();
      });

      $(".guide-example-markup").each(function (index, block) {
        var sampleIndex = index,
          $block = $(block);

        $block
          .find("input:radio, input:checkbox")
          .each(function () {
            var $this = $(this),
              namespacedId = sampleIndex + "-" + $this.attr("id"),
              namespacedName = sampleIndex + "-" + $this.attr("name");

            $this.attr({
              "id": namespacedId,
              "name": namespacedName
            });

            $this
              .next("label")
              .attr("for", namespacedId);
          });

        $block
          .find("input:radio")
          .first()
          .trigger("click");
      });

      checkedOptionStyle.init();
    }
  };

  return exports;
});
