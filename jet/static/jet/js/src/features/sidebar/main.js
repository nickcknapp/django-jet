var $ = require('jquery');
var SideBarApplicationPinning = require('./application-pinning');
var SideBarBookmarks = require('./bookmarks');
var SideBarPopup = require('./popup');

require('perfect-scrollbar/jquery')($);
require('browsernizr/test/touchevents');
require('browsernizr');

var SideBar = function ($sidebar) {
    this.$sidebar = $sidebar;
};

SideBar.prototype = {
    initScrollBars: function ($sidebar) {
        if (!$(document.documentElement).hasClass('touchevents')) {
            $sidebar.find('.sidebar-wrapper').perfectScrollbar();
        }
    },
    initSideBarToggle: function () {
        var toggle = function (e) {
            e.preventDefault();
            this.sideBarToggle();
        };

        $('.sidebar-toggle, #branding-menu').on('click', toggle.bind(this));
        $(document.body).on('click', '.sidebar-backdrop', toggle.bind(this));
    },
    sideBarToggle: function () {
        var $dependent = $('.sidebar-dependent');
        var open = !$dependent.hasClass('sidebar-opened') && !$(document.body).hasClass('menu-pinned');

        $(document.body).toggleClass('non-scrollable', open).removeClass('menu-pinned');
        $dependent.toggleClass('sidebar-opened', open);

        this.storePinStatus(false);
        this.toggleBackdrop(open);
    },
    toggleBackdrop: function (open) {
        if (open) {
            var backdrop = $('<div/>', {class: 'sidebar-backdrop'});
            $(document.body).append(backdrop);
            backdrop.animate({opacity: 0.5}, 300);
        } else {
            $('.sidebar-backdrop').animate({opacity: 0}, 300, function () {
                $(this).remove();
            });
        }
    },
    initPinSideBar: function ($sidebar) {
        $sidebar.on('click', '#branding-pin', (function () {
            var $dependent = $('.sidebar-dependent');

            if ($(document.body).hasClass('menu-pinned')) {
                $dependent.removeClass('sidebar-opened');
                $(document.body).removeClass('menu-pinned');
                this.storePinStatus(false);
            } else {
                this.storePinStatus(true);
                $(document.body).addClass('menu-pinned').removeClass('non-scrollable');
            }
            this.toggleBackdrop(false);
        }).bind(this));
    },
    storePinStatus: function (status) {
        var date = new Date(new Date().getTime() + 3 * 365 * 24 * 60 * 1000);
        document.cookie = "pinned=" + status + "; path=/; expires=" + date.toUTCString();
    },
    run: function () {
        var $sidebar = this.$sidebar;

        new SideBarApplicationPinning($sidebar).run();
        new SideBarBookmarks($sidebar).run();
        new SideBarPopup($sidebar).run();

        try {
            this.initScrollBars($sidebar);
            this.initSideBarToggle();
            this.initPinSideBar($sidebar);
        } catch (e) {
            console.error(e, e.stack);
        }

        $sidebar.addClass('initialized');
    }
};

$(document).ready(function () {
    $('.sidebar').each(function () {
        (new SideBar($(this))).run();
    });
});

module.exports = new SideBar();