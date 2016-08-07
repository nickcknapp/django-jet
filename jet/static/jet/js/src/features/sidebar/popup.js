require('./../../utils/jquery-icontains');

var $ = window.jQuery = require('jquery');

var SideBarPopup = function($sidebar) {
    this.$sidebar = $sidebar;
};

SideBarPopup.prototype = {
    popupDisplayTimeout: null,
    $currentSectionLink: null,
    $currentSection: null,
    $currentSectionListItem: null,
    resetPopupDisplayTimeout: function() {
        if (this.popupDisplayTimeout != null) {
            clearTimeout(this.popupDisplayTimeout);
        }
    },
    setCurrentSectionLink: function($link) {
        if (this.$currentSectionLink) {
            this.$currentSectionLink.removeClass('selected');
        }

        this.$currentSectionLink = $link;

        if (this.$currentSectionLink) {
            this.$currentSectionLink.addClass('selected');
        }
    },
    openPopup: function($popupContainer, delay) {
        var self = this;

        this.resetPopupDisplayTimeout();

        delay = delay && delay != undefined ? delay : 200;

        this.popupDisplayTimeout = setTimeout(function() {
            self.popupDisplayTimeout = null;

            var $sections = $popupContainer.find('.sidebar-popup-section');

            $sections.hide();

            if (self.$currentSectionLink) {
                var $section = $sections.filter('.' + self.$currentSectionLink.data('popup-section-class'));
                var $search = $section.find('.sidebar-popup-search');

                $section.show();
                $search.val('').trigger('change').focus();

                self.$currentSection = $section;
                self.resetCurrentSectionListItems();
                self.$currentSectionListItem = null;
            }

            $popupContainer.stop().fadeIn(200, 'swing');
            $(document.body).addClass('non-scrollable');
        }, delay);
    },
    closePopup: function($popupContainer, delay) {
        var self = this;

        this.resetPopupDisplayTimeout();

        delay = delay && delay != undefined ? delay : 50;

        this.popupDisplayTimeout = setTimeout(function() {
            self.popupDisplayTimeout = null;
            self.setCurrentSectionLink(null);
            self.$currentSection = null;

            $popupContainer.stop().fadeOut(200, 'swing');
                $(document.body).removeClass('non-scrollable');
        }, delay);
    },
    initSectionsDisplay: function($sidebar) {
        var self = this;
        var $popupContainer = $sidebar.find('.sidebar-popup-container');
        var $popup = $sidebar.find('.sidebar-popup');

        $sidebar.find('.popup-section-link').on('mouseenter', function() {
            var $link = $(this);
            var changingSection = self.$currentSectionLink && $link !== self.$currentSectionLink;

            self.setCurrentSectionLink($link);
            self.openPopup($popupContainer, changingSection ? 500 : null);
        }).on('mouseleave', function() {
            self.closePopup($popupContainer);
        });

        $popup.on('mouseenter', function() {
            self.openPopup($popupContainer, 0);
        }).on('mouseleave', function() {
            self.closePopup($popupContainer);
        });
    },
    initSectionsSearch: function($sidebar) {
        $sidebar.find('.sidebar-popup-section').each(function() {
            var $section = $(this);
            var $search = $section.find('.sidebar-popup-search');
            var $items = $section.find('.sidebar-popup-list-item');

            $search.on('change keyup', function() {
                var text = $(this).val();

                $items
                    .hide()
                    .find('.sidebar-popup-list-item-link:icontains("' + text + '")')
                    .closest('.sidebar-popup-list-item')
                    .show();
            });
        });
    },
    resetCurrentSectionListItems: function () {
        this.$currentSection.find('.sidebar-popup-list-item:visible').removeClass('selected');
    },
    moveSectionListItemSelection: function(next) {
        if (this.$currentSectionListItem != null) {
            if (next) {
                this.$currentSectionListItem = this.$currentSectionListItem.nextAll(':visible').first();
            } else {
                this.$currentSectionListItem = this.$currentSectionListItem.prevAll(':visible').first();
            }
        }

        if (this.$currentSectionListItem == null || this.$currentSectionListItem.length == 0) {
            var items = this.$currentSection.find('.sidebar-popup-list-item:visible');
            this.$currentSectionListItem = next ? items.first() : items.last();
        }

        this.resetCurrentSectionListItems();
        this.$currentSectionListItem.addClass('selected');
    },
    initSectionKeyboardControls: function() {
        var self = this;

        $(document).keydown(function(e) {
            if (self.$currentSectionLink == null) {
                return;
            }

            if (e.which == 38) { //up
                self.moveSectionListItemSelection(false);
            } else if (e.which == 40) { //down
                self.moveSectionListItemSelection(true);
            } else if (e.which == 13) {
                if (self.$currentSectionListItem) {
                    document.location = self.$currentSectionListItem.find('a').attr('href');
                }
            } else {
                return;
            }

            e.preventDefault();
        });
    },
    initSectionLists: function($sidebar) {
        var self = this;

        $sidebar.find('.sidebar-popup-list-item-link').on('mouseenter', function () {
            self.$currentSectionListItem = $(this).closest('.sidebar-popup-list-item');
            self.resetCurrentSectionListItems();
            self.$currentSectionListItem.addClass('selected');
        });

        this.initSectionKeyboardControls();
    },
    run: function() {
        try {
            this.initSectionsDisplay(this.$sidebar);
            this.initSectionsSearch(this.$sidebar);
            this.initSectionLists(this.$sidebar);
        } catch (e) {
            console.error(e);
        }
    }
};

module.exports = SideBarPopup;
