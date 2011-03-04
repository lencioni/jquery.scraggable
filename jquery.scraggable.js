(function($, undefined) {

$.fn.scraggable = function(options) {
    options = $.extend({}, $.fn.scraggable.defaults, options);

    return this.each(function() {
        new Scraggable($(this), options);
    });
};

$.fn.scraggable.defaults = {
    axis: false,
    parent: false,
    sensitivity: 1,
    inverted: false,
    containment: false
};

function Scraggable(element, options) {
    this.element = element;
    this.options = options;

    this.width = this.element.outerWidth();
    this.height = this.element.outerHeight();
    this.position = this.element.position();
    this.offset = this.element.offset();
    this.parent = null;

    if (options.containment == 'parent') {
        if (typeof(this.options.parent) == 'object' &&
            this.options.parent.jquery !== undefined) {
            this.parent = this.options.parent;
        }
        if (typeof(this.options.parent) == 'object' &&
            this.options.parent.tagName !== undefined) {
            this.parent = $(this.options.parent);
        }
        if (typeof(this.options.parent) == 'string') {
            this.parent = $(this.options.parent);
        }
        if (this.options.parent == false) {
            this.parent = this.element.parent();
        }
    } else {
        this.parent = $(window.document);
    }

    this.bounds = this.getBounds();

    if (this.parent.get(0).addEventListener) {
        this.parent.get(0).addEventListener('mousewheel', onmousewhell, false);
        this.parent.get(0).addEventListener('DOMMouseScroll', onmousewhell, false);
    }

    var self = this;

    function onmousewhell(event) {
        self.processMouseWhell(event);
    }
}

Scraggable.prototype.processMouseWhell = function(event) {
    var wheelDelta = this.getWheelDelta(event);
    var newOffset = {
        left: this.offset.left + (wheelDelta[0] * this.options.sensitivity),
        top: this.offset.top + (wheelDelta[1] * this.options.sensitivity)
    };

    if (this.bounds) {
        newOffset = this.fixOffset(newOffset);
    }

    this.setPosition(newOffset);
};

Scraggable.prototype.fixOffset = function(newOffset) {
    if (newOffset.left < this.bounds.left) {
        newOffset.left = this.bounds.left;
    }
    if (newOffset.left + this.width > this.bounds.right) {
        newOffset.left = this.bounds.right - this.width;
    }
    if (newOffset.top < this.bounds.top) {
        newOffset.top = this.bounds.top;
    }
    if (newOffset.top + this.height > this.bounds.bottom) {
        newOffset.top = this.bounds.bottom - this.height;
    }
    return newOffset;
};

Scraggable.prototype.setPosition = function(newOffset) {
    var diffTop = newOffset.top - this.offset.top;
    var diffLeft = newOffset.left - this.offset.left;

    if (!this.options.axis || this.options.axis == 'x') {
        this.position.left += (this.options.inverted ? diffTop : diffLeft);
    }
    if (!this.options.axis || this.options.axis == 'y') {
        this.position.top += (this.options.inverted ? diffLeft : diffTop);
    }

    this.element.css({
        top: this.position.top,
        left: this.position.left
    });

    this.offset = newOffset;
};

Scraggable.prototype.getWheelDelta = function(event) {
    // FIREFOX
    if (event.axis != null) {
        if (event.axis == event.HORIZONTAL_AXIS) {
            return [-event.detail / 2, 0];
        }
        if (event.axis == event.VERTICAL_AXIS) {
            return [0, -event.detail / 2];
        }
    }
    // WEBKIT
    if (event.wheelDeltaX != null && event.wheelDeltaY != null) {
        return [event.wheelDeltaX / 60, event.wheelDeltaY / 60];
    }
    // OPERA
    if (event.detail != null && event.axis == null) {
        return [0, -event.detail / 2];
    }

    return [0, 0];
};

Scraggable.prototype.getBounds = function() {
    if (this.options.containment == 'document') {
        return {
            left: 0, top: 0,
            right: this.parent.width(),
            bottom: this.parent.height()
        };
    } else if (this.options.containment == 'parent') {
        var parentOffset = this.parent.offset();
        return {
            left: parentOffset.left, top: parentOffset.top,
            right: parentOffset.left + this.parent.outerWidth(),
            bottom: parentOffset.top + this.parent.outerHeight()
        };
    } else if ($.isArray(this.options.containment)) {
        return {
            left: this.options.containment[0],
            top: this.options.containment[1],
            right: this.options.containment[2],
            bottom: this.options.containment[3]
        };
    }
    return false;
};

})(jQuery);