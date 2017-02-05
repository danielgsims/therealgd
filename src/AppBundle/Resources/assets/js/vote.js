'use strict';

const $ = require('jquery');

/**
 * Get the current vote selection (-1: downvoted, 0: not voted on, 1: upvoted).
 *
 * @param {jQuery} $form
 *
 * @return {number}
 */
function getCurrentChoice($form) {
    if ($form.hasClass('vote-user-upvoted')) {
        return 1;
    }

    if ($form.hasClass('vote-user-downvoted')) {
        return -1;
    }

    return 0;
}

/**
 * @param {jQuery}  $form
 * @param {boolean} isUp
 *
 * @return {number}
 */
function getNewChoice($form, isUp) {
    return getNewScore($form, isUp, getCurrentChoice($form));
}

/**
 * @param {jQuery} $form
 * @param {boolean} isUp
 * @param {number} score
 *
 * @return {number}
 */
function getNewScore($form, isUp, score) {
    const dir = getCurrentChoice($form);
    const weight = isUp ? 1 : -1;

    if (dir === weight) {
        return score - weight;
    }

    if (dir === -weight) {
        return score + 2 * (weight);
    }

    return score + weight;
}

/**
 * @param {jQuery} $form
 * @param {boolean} isUp
 */
function vote($form, isUp) {
    const url = $form.attr('action');

    const data = {
        choice: getNewChoice($form, isUp),
        token: $form.find('input[name=token]').val()
    };

    $.post(url, data).done(() => {
        const newScore = getNewScore($form, isUp, $form.data('score'));

        $form
            .toggleClass(isUp ? 'vote-user-upvoted' : 'vote-user-downvoted')
            .removeClass(isUp ? 'vote-user-downvoted' : 'vote-user-upvoted')
            .data('score', newScore)
            .find('.vote-score').text(newScore);
    }).fail((xhr, textStatus, err) => {
        console && console.log('Failed to vote', textStatus, err);
    });
}

export default function (root) {
    root = root || ':root';

    $(root).find('.user-logged-in .vote').each(function () {
        const $form = $(this);

        $form.submit(event => event.preventDefault());

        $form.find('.vote-button').click(function () {
            vote($form, $(this).hasClass('vote-up'));
        });
    });
}
