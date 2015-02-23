( function() {
    "use strict";

    angular
        .module(    "player",       []              )
        .directive( "player",       PlayerDirective )
        .service(   "TrackService", TrackService    );

    function PlayerDirective() {
        var directive = {
            controller: controller,
            controllerAs: "vm",
            templateUrl: "player.html"
        }

        function controller( $scope, $interval, TrackService ) {
            var vm = this;
            vm.tracks = [];
            vm.curTrack = null;
            vm.styles = {
                tracks: "{transform: 'rotateZ($$deg)'.replace('$$', vm.styles.rotate) }",
                track: "{transform: 'rotateZ($$deg)'.replace('$$', -vm.styles.rotate) }",
                rotate: 45,
            }
            vm.play = play;
            vm.togglePlay = togglePlay;
            init();

            
            //////////////////////// Public
            function play( track ) {

                if (vm.curTrack.sound) {
                    if (vm.curTrack.sound == track.sound) {
                        vm.loading = false;
                        return togglePlay();
                    }
                    else  vm.curTrack.sound.stop();
                }
                vm.loading = true;
                vm.curTrack = track;
                rotate();

                TrackService.stream( track.id, function( sound ) {
                    vm.curTrack.sound = sound;
                    vm.curTrack.sound.play();
                    vm.loading = false;
                    
                    try {
                        $scope.$apply();
                    } catch (e) {}
                } );
            }

            function togglePlay() {
                vm.curTrack.sound.togglePause();
            }

            //////////////////////// Private
            function init() {
                TrackService.get( function( tracks ) {
                    vm.tracks = tracks;
                    vm.curTrack = vm.tracks[0];
                    rotate();
                    $scope.$apply();
                } );
            }

            function rotate() {
                // vm.styles.tracks = vm.styles.tracksTemplate.replace("$$", "50deg");
                vm.styles.rotate = (vm.tracks.indexOf(vm.curTrack) * (360 - (360/vm.tracks.length)) + 45) % 360;
            }

        }
        return directive;
    }

    function TrackService( ) {
        var service = {
            tracks: [],

            get: get,
            stream: stream
        }
        init();

        return service;


        //////////////////////// Private
        function init() {
            SC.initialize( {
                client_id: "cbadbfa41a1b7165cd64bb166ff1170f",
            } );
        }
        function trackById( id ) {
            return service.tracks.filter( function( track ) {
                return track.id === id;
            } )[0]
        }

        //////////////////////// Public
        function get( cb ) {
            SC.get( "/users/65820280/tracks?client_id=cbadbfa41a1b7165cd64bb166ff1170f", function( tracks ) {
                service.tracks = tracks;
                if ( cb ) cb( tracks );
            } );
        }

        function stream( id, cb ) {
            var track = trackById( id );
            // If already cached
            if ( track.sound ) return cb( track.sound );
            // Otherwise stream and cache it
            else {
                SC.stream("/tracks/" + id, function( sound ) {
                    track.sound = sound;
                    cb ( sound );
                } );
            }
        }
    }

} )()

// function Player() {
//     var self = this;
//     this.tracks = [];
//     this.ele = document.getElementById("player");
//     this.ul = this.ele.getElementsByClassName("songs")[0];
//     this.template = this.ele.getElementsByClassName("template")[0];
//     this.template.parentNode.removeChild(this.template);
//     init();

//     function init() {
//         SC.initialize( {
//             client_id: "cbadbfa41a1b7165cd64bb166ff1170f",
//         } );

//         loadTracks( draw );
//     }    

//     function loadTracks( cb ) {
//         SC.get( "/users/65820280/tracks?client_id=cbadbfa41a1b7165cd64bb166ff1170f", function( tracks ) {
//             self.tracks = tracks;
//             if ( cb ) cb();
//         } );
//     }

//     function draw() {
//         self.tracks.forEach( function( track, i ) {
            
//             var template = self.template.cloneNode(true);
//             template.className = "track-" + (i+1);
//             // track.artwork_url.replace("-large", "-t700x700")
//             // Title
//             template.getElementsByClassName("title")[0].innerHTML = track.title
//             // Img
//             template.getElementsByTagName("img")[0].src = track.artwork_url

//             self.ul.appendChild( template );

//             template.onclick = function() {
//                 play( i );
//             };

//         } )
//     }

//     function play( index ) {
//         var track = self.tracks[index];

//         if (track.sound) {
//             self.sound.stop();
//             self.sound = track.sound;
//             self.sound.play();
//         } else {

//         }
//         loading( true );

//         SC.stream("/tracks/" + self.tracks[index].id, function( sound ) {
//             loading( false );
//             self.tracks.sound = sound;
//             // sound.play();
//         } )
//     }

//     // Toggle loading state
//     function loading( on ) {

//     }
// }

// var player = new Player();