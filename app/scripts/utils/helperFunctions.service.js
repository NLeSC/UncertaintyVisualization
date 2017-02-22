(function() {
  'use strict';

  function HelperFunctions(d3, Messagebus, uncertConf) {
    //Helper function to get unique elements of an array
    this.arrayUnique = function(a) {
      return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) {
          p.push(c);
        }
        return p;
      }, []);
    };

    this.determineStoryLineChartHeight = function(chartElements) {
      var heightInPixels = (chartElements - 1) * uncertConf.CHART_DIMENSIONS.storylineChartGapHeight +
                           (uncertConf.CHART_DIMENSIONS.storylineChartBarHeight * chartElements) +
                           uncertConf.CHART_DIMENSIONS.storylineChartMargins.top;

      return heightInPixels;
    };

    this.determineRelationsChartHeight = function(chartElements) {
      var heightInPixels = (chartElements - 1) * uncertConf.CHART_DIMENSIONS.relationsChartGapHeight +
                           (uncertConf.CHART_DIMENSIONS.relationsChartBarHeight * chartElements) +
                           uncertConf.CHART_DIMENSIONS.relationsChartMargins.top;

      return heightInPixels;
    };

    this.determinePerspectiveChartHeight = function(chartElements) {
      var heightInPixels = (chartElements - 1) * uncertConf.CHART_DIMENSIONS.perspectiveChartGapHeight +
                           (uncertConf.CHART_DIMENSIONS.perspectiveChartBarHeight * chartElements) +
                           uncertConf.CHART_DIMENSIONS.perspectiveChartMargins.top;

      return heightInPixels;
    };

    this.determinePerspectiveBubbleChartHeight = function(chartElements) {
      var heightInPixels = (chartElements - 1) * uncertConf.CHART_DIMENSIONS.perspectiveBubbleChartGapHeight +
                           (uncertConf.CHART_DIMENSIONS.perspectiveBubbleChartBarHeight * chartElements) +
                           uncertConf.CHART_DIMENSIONS.perspectiveBubbleChartMargins.top;

      return heightInPixels;
    };

    this.determineUniqueActors = function(data) {
      var concatenatedActors = [];
      var uniqueActors= [];

      if (data.actors) {
        var keys = Object.keys(data.actors);
        if (keys.length === 0) {
          concatenatedActors.push('none');
        } else {
          keys.forEach(function(key) {
            var keysActors = data.actors[key];
            keysActors.forEach(function(keysActor) {
              var actorLabel = key + ' : ' + keysActor;
              concatenatedActors.push(actorLabel);
            });
          });
        }
        uniqueActors = this.arrayUnique(concatenatedActors);
      } else {
        uniqueActors = ['no actors'];
      }

      return uniqueActors;
    };

    this.determineUniqueSources = function(data) {
      var concatenatedSources = [];

      var keys = Object.keys(data.mentions);
      if (keys.length === 0) {
        concatenatedSources.push('none');
      } else {
        keys.forEach(function(key) {
          var mention = data.mentions[key];

          mention.perspective.forEach(function(perspective) {
            var sources = perspective.source;
            if( typeof sources === 'string' ) {
              sources = [ sources ];
            }

            sources.forEach(function(source) {
              concatenatedSources.push(source);
            });
          });
        });
      }
      var uniqueSources = this.arrayUnique(concatenatedSources);

      return uniqueSources;
    };

    this.determineUniqueCitationSources = function(data) {
      var concatenatedCitationSources = [];

      var keys = Object.keys(data.mentions);
      if (keys.length === 0) {
        concatenatedCitationSources.push('none');
      } else {
        keys.forEach(function(key) {
          var mention = data.mentions[key];

          mention.perspective.forEach(function(perspective) {
            var sources = perspective.source;
            if( typeof sources === 'string' ) {
              sources = [ sources ];
            }

            sources.forEach(function(source) {
              var splitSource = source.split(':');
              if (splitSource[0] === 'cite') {
                concatenatedCitationSources.push(splitSource[1]);
              }
            });
          });
        });
      }
      var uniqueCitationSources = this.arrayUnique(concatenatedCitationSources);

      return uniqueCitationSources;
    };

    this.determineUniqueAuthors = function(data) {
      var concatenatedAuthors = [];

      var keys = Object.keys(data.mentions);
      if (keys.length === 0) {
        concatenatedAuthors.push('none');
      } else {
        keys.forEach(function(key) {
          var mention = data.mentions[key];

          mention.perspective.forEach(function(perspective) {
            var sources = perspective.source;
            if( typeof sources === 'string' ) {
              sources = [ sources ];
            }

            sources.forEach(function(source) {
              var splitSource = source.split(':');
              if (splitSource[0] === 'author') {
                concatenatedAuthors.push(splitSource[1]);
              }
            });
          });
        });
      }
      var uniqueAuthors = this.arrayUnique(concatenatedAuthors);

      return uniqueAuthors;
    };

    this.filterFunction = function(dimension, filters) {
      dimension.filter(null);
      if (filters.length === 0) {
        dimension.filter(null);
      } else {
        dimension.filterFunction(function(d) {
          for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if (filter.isFiltered && filter.isFiltered(d)) {
              return true;
            } else if (filter <= d && filter >= d) {
              return true;
            }
          }
          return false;
        });
      }
      return filters;
    };

    this.customDefaultFilterHandler = function(dimension, filters) {
      Messagebus.publish('newFilterEvent', [this, filters, dimension]);

      return this.filterFunction(dimension, filters);
    }.bind(this);

    this.symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);

    this.mentionToTxt = function(d) {
      var raw = d.mentions;

      var txt = '';
      raw.forEach(function(mention) {
        var pre = mention.snippet[0].substring(0, mention.snippet_char[0]);
        var word = mention.snippet[0].substring(mention.snippet_char[0],mention.snippet_char[1]);
        var post = mention.snippet[0].substring(mention.snippet_char[1], mention.snippet[0].length);

        txt += pre + word + post + '\n';
      });

      return txt;
    };

    this.buildDimensionWithProperties = function(ndxService, keys) {
      // BRR this is horrible, but it works for now (maarten)
      var newDimension = ndxService.buildDimension(function(d) {
        var result = [];
        keys.forEach(function(key) {
          var splitKey = key.split('.');
          if (splitKey.length === 1) {
            if (d[splitKey[0]] instanceof Array) {
              d[splitKey[0]].forEach(function(entry){
                result.push(entry);
              });
            } else {
              if (d[splitKey[0]] instanceof String) {
                result.push(d[splitKey[0]]);
              } else {
                if (d.actors) {
                  var keys = Object.keys(d.actors);
                  keys.forEach(function(key) {
                    var keysActors = d.actors[key];
                    keysActors.forEach(function(keysActor) {
                      var actorLabel = key + ' : ' + keysActor;
                      result.push(actorLabel);
                    });
                  });
                } else {
                  result.push('no actors');
                }                
              }
            }
          } else if (splitKey.length === 2) {
            if (d[splitKey[0]] instanceof Array) {
              d[splitKey[0]].forEach(function(entry, index){
                if (d[splitKey[0]][index][splitKey[1]] instanceof Array) {
                  d[splitKey[0]][index][splitKey[1]].forEach(function(entry){
                    result.push(entry);
                  });
                } else {
                  result.push(d[splitKey[0]][index][splitKey[1]]);
                }
              });
            } else {
              if (d[splitKey[0]][splitKey[1]] instanceof Array) {
                d[splitKey[0]][splitKey[1]].forEach(function(entry){
                  result.push(entry);
                });
              } else {
                result.push(d[splitKey[0]][splitKey[1]]);
              }
            }
          }
        });
        return result;
      }.bind(this));

      return newDimension;
    }.bind(this);

    this.setActorColors = function(actorColors) {
      this.actorColors = actorColors;
    };

    this.getActorColors = function() {
      return this.actorColors;
    };

    this.setGroupColors = function(groupColors) {
      this.groupColors = groupColors;
    };

    this.getGroupColors = function() {
      return this.groupColors;
    };

    this.getOrdinalColors = function() {
      return ['#d9a058', '#9306f9', '#15b6ff', '#03c70e', '#c21372', '#107356', '#ca1601', '#6255c6', '#cc9eb6', '#fd76fa', '#a5b403', '#a74741', '#56c06a', '#496981', '#616b0f', '#ff8f08', '#a7af8e', '#0fbdc9', '#8e4f88', '#ba9cf2', '#1c50ff', '#fc83c5', '#1d67b2', '#7c5f52', '#a61fc6', '#a74a01', '#cb053d', '#1a7609', '#ff8790', '#a1b35d', '#8eafc9', '#ab309b', '#d4a412', '#49be9a', '#8a5c25', '#d59f88', '#fd8d61', '#74be31', '#5d6a44', '#a94165', '#7a5c76', '#8eabeb', '#7745d9', '#3f7130', '#7eb6af', '#695aa6', '#e38ce5', '#157175', '#87b780', '#27c54b', '#bc3323', '#baad3e', '#2459e5', '#beaa6c', '#4ab8dd', '#d397d1', '#93535e', '#b1aaa9', '#5a6394', '#f19543', '#5e6863', '#8a4ba7', '#ec90b1', '#8233ec', '#aa3983', '#b1a5d1', '#963bba', '#ee947c', '#bf2754', '#6f672b', '#e1989d', '#905740', '#91b845', '#2362c5', '#7d6205', '#0f6ba0', '#c00489', '#29c286', '#426e5d', '#a14e27', '#fd7cdf', '#81ba63', '#b316ae', '#ea9a17', '#46710c', '#cd0225', '#bdad0b', '#ba343c', '#97a5ff', '#974d70', '#dda038', '#e79967', '#95570a', '#78b89b', '#7d6139', '#07753d', '#5ac213', '#50bcae', '#a109e0', '#e587f9', '#8fb918', '#bfa881', '#7a588e', '#994595', '#caa748', '#c9a29c', '#6bb2e4', '#b5a6bd', '#07c471', '#a9b073', '#146f87', '#6daeff', '#3f7044', '#6e626a', '#fe85ab', '#576d29', '#b33a4e', '#61b8c2', '#b93807', '#6d654b', '#61be7f', '#cb94f9', '#d4a174', '#93b0b6', '#64c04c', '#a8b334', '#7f4ac0', '#aca3e5', '#e88ecb', '#4850ec', '#ae432f', '#ff8a76', '#b6316b', '#8c35d9', '#1f7528', '#65637b', '#b6ae56', '#9eafa2', '#815b64', '#a44853', '#b8a995', '#ba0d9b', '#6944ec', '#255dd9', '#5f59b9', '#5d51d9', '#f18f9d', '#89547c', '#5062a6', '#416c75', '#d096e5', '#9b3da7', '#7f549a', '#8c5852', '#96acd7', '#fd8f32', '#53c23a', '#91b48d', '#43c25b', '#db96bd', '#a44277', '#c60e60', '#c7a92c', '#6dbb8d', '#af421a', '#c42431', '#7c2ff9', '#6041f9', '#fb8f4b', '#b206ba', '#c52315', '#ea9852', '#b22d89', '#c99dca', '#94b572', '#f68e89', '#f484d8', '#cda55f', '#5cb2f8', '#3e6994', '#14c0a7', '#4b60b3', '#2eb7f1', '#acb146', '#7255ad', '#965434', '#79bd44', '#b4ac7a', '#7650b9', '#a333ad', '#626a31', '#6fb4d7', '#17c639', '#98541f', '#3dbad0', '#9437c6', '#92b39b', '#f39527', '#6e5f82', '#516c51', '#5a6775', '#6d645d', '#81b3c3', '#0f7363', '#6d6802', '#df9a8f', '#9f4e3b', '#2ac193', '#b5355a', '#4c6f37', '#a3abc3', '#cba0a9', '#bd2e48', '#de9c7b', '#984b7c', '#80601c', '#5d6957', '#a1a8de', '#855d46', '#c69bde', '#4dbbbc', '#4465a0', '#9eb280', '#645e9a', '#885770', '#556687', '#97524d', '#6b673f', '#bfa2c3', '#f589b7', '#9aa7f2', '#c7a48f', '#426d69', '#da99b0', '#2e6c8d', '#f282ec', '#0e744a', '#dc92d8', '#9cb628', '#bca0d7', '#73bc71', '#9eb54e', '#4b7021', '#f4935a', '#b1b11d', '#375ecc', '#bb227d', '#07bfb5', '#c9094f', '#e19e49', '#69be5b', '#7ebb54', '#327417', '#f6906f', '#7b47cc', '#8e44b3', '#3cc422', '#a416d3', '#a726ba', '#9022ec', '#b73930', '#85bb32', '#327156', '#8e4c94', '#ea9490', '#fe79ec', '#4cc078', '#9d4c5f', '#91b764', '#a24e18', '#6fbf15', '#6b681a', '#8b5c14', '#e89b30', '#b09dff', '#f49504', '#b03f42', '#5256d2', '#b3ae65', '#d2a537', '#dfa014', '#fc889d', '#5ebca1', '#7a632b', '#7b5a82', '#c8a674', '#c9a90e', '#7aafeb', '#76641b', '#a3acb6', '#6fb9a8', '#c2a957', '#4f6e44', '#bba5b0', '#84aaff', '#cba481', '#79605e', '#dc9e67', '#e790be', '#875c39', '#72599a', '#546e0d', '#84b972', '#dc8df3', '#d6a349', '#d59d9c', '#5eb7d0', '#b33277', '#6d5e8e', '#a63a8f', '#a13c9b', '#9e4389', '#aba2f2', '#80b88d', '#2c7069', '#7a6145', '#08bbdd', '#84b0d7', '#80bc16', '#e98bd8', '#2e733d', '#6c4fcc', '#c52324', '#9427e0', '#75bb7f', '#b04204', '#f17ffa', '#8db855', '#cc0332', '#bd2860', '#4cc24b', '#0ec55b', '#bcad2b', '#c2253d', '#ac4059', '#57be8d', '#5549f3', '#b33e22', '#803cdf', '#2154f2', '#5e4edf', '#b81c95', '#435fbf', '#ae29a1', '#f9921b', '#255bdf', '#a9b156', '#ef85e6', '#e79b42', '#9ab63c', '#c6a93f', '#a3456b', '#b33665', '#1968ac', '#d9a223', '#bfab47', '#81acf8', '#a6455f', '#2164bf', '#ff7fcb', '#b03771', '#f08ac4', '#646288', '#4fb6e4', '#dc94cb', '#31724a', '#8c41c0', '#aea7ca', '#4755df', '#b8381b', '#416f50', '#13c37f', '#bb9ee5', '#107620', '#d990ec', '#6fbd63', '#855b58', '#ab4621', '#61694b', '#ea9675', '#9346a1', '#e79782', '#4fbf86', '#387329', '#5a6d19', '#087081', '#8251a0', '#61c130', '#7d5694', '#9632cc', '#a44b35', '#995240', '#8c47ad', '#726538', '#8c5664', '#965064', '#afab9b', '#d79baa', '#87aedd', '#8bb3a8', '#e295aa', '#8f536a', '#bda79c', '#8bace4', '#41679a', '#82b4b5', '#5a6c38', '#73ba94', '#b0ad87', '#994f59', '#bfa3b6', '#8d5a33', '#4f6a6f', '#86b5a1', '#066c9a', '#676938', '#336d81', '#8c5282', '#08726f', '#885a4c', '#63b9b5', '#d39ac4', '#a4b26c', '#536b5d', '#6e6176', '#616669', '#835f33', '#d0a36d', '#905176', '#9db194', '#d1a096', '#a2aea8', '#7a5e6a', '#65656f', '#716451', '#b4ab8e', '#696657', '#8fb2af', '#9d4f47', '#3d64ac', '#ee9660', '#9e510c', '#656a22', '#ac433b', '#97afbc', '#a437a1', '#86538e', '#9c512d', '#5159cc', '#37c36a', '#656751', '#96488e', '#257436', '#abad95', '#c0a5a2', '#1bbae4', '#456b7b', '#94b832', '#7bb986', '#756258', '#6157bf', '#26b8ea', '#92572d', '#f7923b', '#835588', '#c599ec', '#5d5bb3', '#a93595', '#ee9296', '#b5af35', '#e49d24', '#5ebf71', '#e08fdf', '#bd9af9', '#72b5c9', '#b23e36', '#2f6e7b', '#4f5bc6', '#91499b', '#b1a8b6', '#875e07', '#f98b97', '#7557a0', '#8f5658', '#8cb687', '#73b6bc', '#f29368', '#99b479', '#aeb05d', '#f98d7c', '#43c271', '#bf2d37', '#ec88df', '#705c94', '#85596a', '#ad3c6b', '#a04965', '#cea721', '#c6a866', '#156aa6', '#48bda7', '#f38caa', '#92add0', '#76633f', '#7eadf2', '#a2a9d0', '#aa444d', '#58b3f1', '#f487cb', '#acae80', '#58648e', '#b92a71', '#80b1d0', '#8f591e', '#c3a688', '#89585e', '#316f6f', '#c1ab36', '#f886be', '#ea92a3', '#85b694', '#1f65b9', '#815f3f', '#b1af4e', '#a04c4d', '#e493b7', '#a73e7d', '#1fbebb', '#bbac5e', '#726611', '#53b5eb', '#5dbd93', '#af3b5f', '#cfa550', '#a2b187', '#cf9cbd', '#9b4782', '#c3ab1f', '#ada0f9', '#893ecc', '#c02c2a', '#c897f2', '#ed983a', '#824cb3', '#5cc143', '#ff8c53', '#e39b60', '#935546', '#e689ec', '#c12b0a', '#28c462', '#67bc86', '#723bf3', '#4852e6', '#9117f3', '#e19c6e', '#5b5dac', '#b43d11', '#37c453', '#8bba3c', '#fd8a83', '#675ca0', '#7453b3', '#6e4cd2', '#f29183', '#6847e6', '#49c32f', '#c12c1c', '#44b9d6', '#69bf3a', '#bd3213', '#8b3ad3', '#4dc162', '#804fad', '#56c153', '#41c343', '#ab460f', '#88ba4d', '#c9171e', '#c71937', '#b5268f', '#c61a43', '#c01f66', '#bd1783', '#c31d5a', '#c8182b', '#b021a7', '#a52db4', '#1f52f9', '#2357ec', '#9e2fc0', '#982cd3', '#8138e6', '#b83448', '#fa80d8', '#f1954b', '#8f29e6', '#255fd2', '#6045f3', '#a034b3', '#ba2f5a', '#9da5f9', '#e49b59', '#70be44', '#7bbd3b', '#995416', '#7e40d9', '#b62b7d', '#b1b107', '#7bbc5c', '#3851f2', '#a029c6', '#a04677', '#d7a240', '#a82cad', '#34740b', '#7046df', '#9836c0', '#8736df', '#793de6', '#2cc610', '#b018b4', '#37c09a', '#af3383', '#ef8db7', '#6bbe54', '#a813cd', '#a603d9', '#457118', '#7a4ac6', '#a91dc0', '#9c0fe6', '#ca170d', '#9925d9', '#474af9', '#7336f9', '#8427f9', '#a4b41b', '#fc8f44', '#832df3', '#8842c6', '#816013', '#4fb2ff', '#d8a05f', '#8bb85c', '#adb13e', '#35b5f8', '#784dc0', '#07c642', '#835394', '#4d6e4a', '#c41c54', '#ef9659', '#ba3336', '#46688d', '#24c378', '#4a6f3e', '#377150', '#a74a18', '#1a752f', '#9ca8e4', '#b5a4ca', '#f187d2', '#21bccf', '#c99bd8', '#676a01', '#f99206', '#73b2dd', '#6e6732', '#914f82', '#8ab779', '#b63554', '#bf9ede', '#f6924b', '#e59975', '#79614b', '#8b5a40', '#d997c4', '#c69fc4', '#805a76', '#d995d1', '#e4978f', '#98b38e', '#a64a27', '#ab358f', '#82b79b', '#5360ac', '#dc9c82', '#92554c', '#6d56b3', '#b5a3d7', '#bcaa73', '#95553a', '#f9905a', '#855e25', '#636945', '#ab4347', '#ca0849', '#cc98de', '#fe8f1c', '#a6a7d7', '#6abaa1', '#55639a', '#e9977c', '#ed9482', '#586c3e', '#b79feb', '#cda28f', '#a6b346', '#ad4335', '#606b1a', '#6f6545', '#d79d96', '#357330', '#18c28c', '#f581e6', '#6b6088', '#d1a182', '#9b4f53', '#87b96b', '#bc0a95', '#e58ed1', '#7b54a0', '#3660c5', '#76bc6a', '#4659d2', '#1b6d8d', '#b810a1', '#d3a17b', '#3d7057', '#96459b', '#c999e5', '#796332', '#b1a3de', '#4abac9', '#9a523a', '#98b564', '#417129', '#65be78', '#6954bf', '#a34859', '#8cb772', '#c29ce5', '#a04e34', '#357244', '#596681', '#f09375', '#6b58ad', '#a7aabc', '#e6959d', '#91a9f2', '#c20183', '#9d511f', '#f4951a', '#457037', '#cda47b', '#ad4053', '#d5a16d', '#96b480', '#79b7a8', '#f58e90', '#bc2e4e', '#81b979', '#9eb601', '#95b755', '#d395de', '#5f5fa0', '#79bb79', '#8e5a2c', '#a34b3b', '#dc90e5', '#4e6d57', '#c1a87a', '#bc2177', '#5b6b4b', '#98b645', '#6eb7b5', '#66b7c9', '#d4a358', '#48bf8d', '#a3b356', '#a0b279', '#216c93', '#4e6f30', '#43bbc2', '#b13e3c', '#426a87', '#785d7c', '#b0289b', '#e19d41', '#ee9826', '#97b1a2', '#5ab6dd', '#86b2bc', '#56677b', '#7e5d5e', '#a0b53d', '#197443', '#d599bd', '#5dbbae', '#e591c4', '#257163', '#f59075', '#b0ae73', '#257256', '#79579a', '#85509a', '#e09a89', '#5d6c2a', '#f89227', '#695e94', '#46c07f', '#9db46b', '#a24b47', '#4d700d', '#9b5134', '#3c7237', '#ef9801', '#6bb5d0', '#a43b95', '#775b88', '#bc1989', '#8b5476', '#e69b4a', '#83577c', '#686182', '#eb966e', '#1c7350', '#526f22', '#a8a4eb', '#96b819', '#a04383', '#c69dd1', '#8bb1c3', '#c22543', '#a8a0ff', '#825d52', '#c2a1bd', '#905909', '#477030', '#35699a', '#b9aa81', '#6ab0f8', '#dd98aa', '#c5a948', '#736532', '#81afe4', '#a8ad9b', '#c8a1b0', '#9faeaf', '#d49bb0', '#cda0a3', '#bf1f6c', '#f58ca4', '#915364', '#e096b0', '#786404', '#cba740', '#94506a', '#496794', '#97adca', '#b3a9a2', '#476d63', '#90acde', '#536975', '#b73066', '#e892aa', '#6b6463', '#bbaa7a', '#bea5a9', '#c8a757', '#64baa8', '#646663', '#766064', '#aaaca9', '#3d6e63', '#5a6869', '#60685d', '#fc85b1', '#74652b', '#aeaaaf', '#6fb1eb', '#c1aa5e', '#d99ba3', '#5fb0ff', '#b8ac6c', '#7f612b', '#69b9ae', '#776339', '#46bcb5', '#3d6d6f', '#775e70', '#994d6a', '#bfa795', '#7b631c', '#1b7169', '#26bfae', '#3867a0', '#aaa9c3', '#686469', '#c2a873', '#6b6370', '#cfa710', '#a6acaf', '#616482', '#a1af9b', '#b6ac73', '#d3a422', '#805d58', '#a2b272', '#c2a3b0', '#925170', '#dea023', '#3b714a', '#73625e', '#b6a99c', '#da9e74', '#7eb0dd', '#9baeb6', '#a4af95', '#67665d', '#536a69', '#cfa09c', '#4a6a75', '#3b6c7b', '#246e81', '#6c6738', '#74606a', '#566b57', '#d899b7', '#fe8797', '#6fba9a', '#576a63', '#57686f', '#7db894', '#c5a495', '#c3ab0d', '#755d82', '#93afc3', '#516781', '#466c6f', '#5eb4e4', '#a9a5de', '#b4a8af', '#7db4bc', '#9badc3', '#716170', '#5e657b', '#caa66d', '#a0b18e', '#616575', '#1e6f7b', '#9ab19b', '#aead8e', '#725f7c', '#7d5c70', '#7c5e64', '#93b2a8', '#b8a6b6', '#df98a3', '#885c33', '#dba049', '#df9e58', '#35bcc9', '#256b9a', '#87b4af', '#c5a1b6', '#3f63b3', '#8e517c', '#4c659a', '#5d619a', '#a7a9ca', '#a4a6e4', '#2c7250', '#7a6058', '#586b51', '#7cb3c9', '#c7a2a3', '#8c5a3a', '#2ac0a1', '#aeae7a', '#77b98d', '#8fb3a2', '#95b394', '#835b5e', '#b9a4c3', '#4b6d5d', '#7e6132', '#1d725c', '#bca2ca', '#94aae4', '#97b0af', '#c7a67a', '#85b1c9', '#4e697b', '#73634b', '#bca4bd', '#686831', '#b7a7a9', '#776252', '#d697cb', '#e39796', '#954e76', '#a64171', '#bcac57', '#b7af09', '#626094', '#636857', '#d2a35f', '#e89596', '#de96b7', '#c4a3a9', '#53bac2', '#5f6951', '#4e63a0', '#3f6b81', '#9fadbc', '#9fabca', '#7e5f4c', '#3ab4ff', '#546c4b', '#366e75', '#8d5470', '#755f76', '#d09aca', '#2cbdc2', '#686375', '#69682a', '#b2a6c3', '#aea8bd', '#a14671', '#a8b25d', '#4b6c69', '#7f5c6a', '#64bb9a', '#78b5c3', '#77b1e4', '#98505f', '#aaaab6', '#8ea7ff', '#5cb9bc', '#e495a3', '#c3a59c', '#5c6c31', '#526594', '#326a93', '#74b8a1', '#56bbb5', '#e49d16', '#8bb2b5', '#99aade', '#bba98e', '#945358', '#a6aea2', '#8fb1bc', '#adaba2', '#6f6457', '#9bb0a8', '#daa213', '#67b4dd', '#abb06c', '#d89f7b', '#40bfa1', '#3562bf', '#c1a68e', '#875b52', '#71661b', '#6b6651', '#fb88a4', '#5a6a5d', '#baa7a2', '#2f66ac', '#2d715d', '#716264', '#a7b07a', '#5e676f', '#b7af1e', '#67674b', '#965253', '#835d4c', '#d39f8f', '#cea374', '#79acff', '#865582', '#b2ab95', '#cba295', '#825f39', '#ae3877', '#6b617c', '#9c4f4d', '#b9ad47', '#616a38', '#4f6b63', '#676a0f', '#536e19', '#80568e', '#5fc13a', '#f88e83', '#abb14e', '#ae2f95', '#386f69', '#f87dec', '#585abf', '#24734a', '#ab4619', '#b23b54', '#8ba9f8', '#b8a0de', '#94571e', '#9e496b', '#7841df', '#a1495f', '#39723d', '#446f4a', '#e59b51', '#8a5a46', '#985247', '#674adf', '#7755a7', '#cc9cc4', '#9e5117', '#865776', '#27c622', '#c4a86d', '#97b74d', '#9b4d65', '#45c339', '#9c5127', '#fa8b90', '#a54b2e', '#7fba6b', '#914c8e', '#915552', '#8ab59b', '#a64a20', '#8343cc', '#a83a89', '#db9c89', '#6c6810', '#fb8d6f', '#9c448f', '#b1ae6c', '#b23e2f', '#b8a2d1', '#8db932', '#daa051', '#83bb3b', '#91573a', '#7b6324', '#ee9830', '#eb83fa', '#845e2c', '#5ac063', '#65693e', '#985426', '#a34b41', '#b82f60', '#7ab2d7', '#c99fbd', '#6bbf30', '#d0a548', '#ee8acb', '#b43660', '#aaa7d0', '#50be93', '#76aef8', '#46b5f1', '#8daed7', '#6cbd6a', '#895094', '#a3427d', '#eb9489', '#ea90b7', '#566c44', '#b0b056', '#b73929', '#3a7321', '#8a5c1d', '#9a540b', '#38c42f', '#884ea1', '#ef82f3', '#c2ab2c', '#935726', '#63c124', '#6857b9', '#8e5a25', '#dd9a96', '#79bc63', '#a5484d', '#6659b3', '#d693e5', '#f983cb', '#fb7de6', '#4bb4f8', '#66608e', '#9eaad7', '#6f53b9', '#84adeb', '#f38abe', '#ed9667', '#23706f', '#57bca8', '#c5a681', '#2969a0', '#445dc5', '#f39531', '#b0b12a', '#20c62e', '#f59352', '#bc332a', '#9cb555', '#63bd8d', '#645bad', '#f780df', '#296d87', '#3b6a8d', '#5546f9', '#a9472f', '#4f668e', '#e291cb', '#466e57', '#a9b329', '#ec9842', '#6cbc7f', '#4e5dbf', '#5cbe86', '#b33e29', '#f2953a', '#7151bf', '#865d40', '#f284df', '#d99d8f', '#adb065', '#2ec542', '#067628', '#df8af9', '#b9ac65', '#d39da3', '#6fbc78', '#b2ac81', '#9047a7', '#9e4095', '#9e4c59', '#a9af87', '#1dc469', '#c4242b', '#cfa288', '#ce9eb0', '#a2a4f2', '#8e565e', '#c6230b', '#a138a7', '#5958c6', '#8449b9', '#a54565', '#3165b2', '#7d4db9', '#5352df', '#636a2a', '#c9a750', '#aab31c', '#3bbdbb', '#ae4228', '#96b56b', '#497029', '#c0aa65', '#e3997b', '#167616', '#78be15', '#a94453', '#983ead', '#9bb472', '#92b83c', '#3958df', '#327337', '#be2d3d', '#bc331c', '#455bcc', '#a5b080', '#745b8e', '#a93d77', '#ed8dbe', '#ef9190', '#eb8dc4', '#c0264e', '#8146c6', '#7952ad', '#4c5fb9', '#a221cd', '#9d39ad', '#fe8f28', '#bdad1e', '#5b56cc', '#277517', '#c7a75e', '#76b3d0', '#fc8f3b', '#7648d3', '#2a7430', '#c02c23', '#8e3dc6', '#f686c5', '#a931a1', '#7ebc26', '#c39fca', '#9db61a', '#f57ef3', '#86ba55', '#296f75', '#a5a2f9', '#895288', '#b29ff2', '#4962ac', '#f39361', '#82bb44', '#895c2c', '#59b8c9', '#9ab55d', '#8a566a', '#f783d2', '#925733', '#cea558', '#48c253', '#756524', '#c8a920', '#32beb5', '#7b50b3', '#855e1d', '#b7ad4f', '#5f4be6', '#9040ba', '#3bb8e4', '#556d31', '#7eb980', '#67c043', '#76be25', '#89b68d', '#8b5c08', '#a64847', '#af3f48', '#e29d39', '#89ba45', '#f4917c', '#9fa6eb', '#a2b533', '#beab4f', '#fb7af3', '#be9ceb', '#abb305', '#9c4a71', '#91b679', '#9942a1', '#5761a0', '#964b82', '#3cc278', '#b13b59', '#f78b9d', '#b93442', '#137536', '#62bf6a', '#6b52c6', '#8c4f8e', '#df94c4', '#de9e60', '#61c054', '#72aff1', '#8fb680', '#8eb594', '#6ebe4c', '#b3af46', '#df9c75', '#d1a540', '#e693b0', '#9fb364', '#94a7f8', '#72be3b', '#d291f9', '#d7a238', '#a34e0d', '#29750a', '#2d7428', '#9e4f41', '#865e13', '#875964', '#bd3208', '#ad1aba', '#e38fd8', '#9fb545', '#6db6c2', '#f79068', '#c19af2', '#307420', '#9bb287', '#80bb4c', '#6dbf25', '#be078f', '#9e477d', '#943fb3', '#63b5d6', '#df91d1', '#c12549', '#a3b429', '#6a6823', '#4c7018', '#dea02f', '#b72a77', '#e39d2f', '#d7a166', '#9038cc', '#5b6d0e', '#8eb927', '#52c071', '#b83922', '#8b4d9a', '#b4af3e', '#b513a7', '#ae3f4e', '#f1936e', '#5ec05b', '#297344', '#506f29', '#89afd0', '#f38e97', '#ab3d71', '#58c223', '#42703e', '#b7354e', '#94b487', '#d098d8', '#7e52a7', '#b63936', '#7058a6', '#e6996e', '#b04210', '#75bd54', '#ec929d', '#a0a3ff', '#c5231d', '#905915', '#6940f3', '#dca041', '#e89b39', '#3c7217', '#ac4341', '#d79f82', '#ba296c', '#f79243', '#944995', '#b7ab88', '#a6369b', '#8d584c', '#744bcc', '#945540', '#f09652', '#97542d', '#b43a48', '#20743d', '#4cc323', '#e29a82', '#b53a42', '#8e5846', '#5c53d2', '#49c16a', '#b5ae5e', '#7d5888', '#b1327d', '#3fc186', '#734ec6', '#9642a7', '#5abf78', '#95b827', '#546d37', '#923cc0', '#b42c83', '#776411', '#afb134', '#9f4c53', '#d5a350', '#fa86b8', '#826006', '#cca737', '#a13f8f', '#f89232', '#65bf63', '#bb2e54', '#2cbbd6', '#fe8a7d', '#79b6b5', '#b5393c', '#3ec362', '#376b87', '#c3a94f', '#a53e83', '#59c14b', '#c32437', '#fa8d76', '#bc2866', '#84ba5c', '#565cb9', '#c39dd7', '#864bad', '#b83812', '#765994', '#62b3eb', '#b53d05', '#d1a366', '#b6af2a', '#ada5d7', '#7c6212', '#f08fa4', '#a8416b', '#4a6e51', '#337063', '#9bb633', '#d695d8', '#69bb94', '#bbad35', '#a7b33d', '#f789b1', '#8a5858', '#88bb17', '#51bda1', '#bda888', '#ec85ec', '#7d5a7c', '#8d4aa1', '#3fbeae', '#484df2', '#41b6ea', '#50c243', '#e89960', '#5f6a3e', '#a24e20', '#d29cb7', '#9c35ba', '#52c15b', '#74b7af', '#55bf7f', '#a04e2e', '#a4b34e', '#706623', '#57bd9a', '#945715', '#40c093', '#8645c0', '#6c5c9a', '#237520', '#36c18c', '#fc8d68', '#71653f', '#8fb84d', '#bb3330', '#cf94f2', '#d8a22e', '#e886f3', '#d393ec', '#3dc44b', '#7cba72', '#a74a0e', '#fe8c5a', '#1ec553', '#e193be', '#666a1a', '#34c539', '#cda72d', '#fe82be', '#9243ad', '#aa4728', '#756345', '#4fb9d0', '#77bd4c', '#d88ef9', '#ef9818', '#f89061', '#7db7a1', '#93b75d', '#595fa6', '#ac0fc6', '#b43171', '#586d22', '#6e5aa0', '#b1376b', '#a8473b', '#35bfa7', '#e29c67', '#625da6', '#c0ab3f', '#65c114', '#d992de', '#ac4603', '#eb984a', '#835970', '#38705d', '#7b613f', '#e69789', '#a33f89', '#4c6887', '#02b7f8', '#ad3489', '#bf2c30', '#66b1f1', '#c12b14', '#526d3e', '#40c411', '#5f628e', '#82b5a8', '#ab405f', '#e989e5', '#31c45b', '#fd7fd2', '#b4a1e5', '#df8dec', '#4161b9', '#2460cc', '#b02e8f', '#3b66a6', '#8848b3', '#4ec312', '#cc96ec', '#18c19a', '#e99b25', '#db9b9c', '#d3a52d', '#9c419b', '#a74459', '#a632a7', '#db9e6d', '#9aabd0', '#ac387d', '#c497f9', '#84b886', '#ef88d8', '#2c68a6', '#a6b264', '#fc8a8a', '#a94735', '#d19ea9', '#bfa0d1', '#e68cdf', '#3e720b', '#89b964', '#68b8bc', '#eb8bd2', '#cba566', '#c7a936', '#5c6488', '#56c22f', '#9a3ab3', '#f18cb1', '#806124', '#437121', '#e28af3', '#715d88', '#34c27f', '#bd2d42', '#ee8faa', '#2fc371', '#844ea7', '#f19189', '#e09e51', '#af0bc0', '#97a8eb', '#ca1716', '#994888', '#5f6c22', '#9e3da1', '#8a45b9', '#9b4a76', '#af4221', '#afa1eb', '#fa8f53', '#88abf2', '#86bb26', '#726603', '#6452cc', '#8fb76b', '#476f44', '#696745', '#7dbc31', '#b43e1a', '#72bd5c', '#d591f2', '#3363b9', '#7f5f46', '#b501b4', '#b59df9', '#4664a6', '#be275a', '#ae3c65', '#69bd71', '#555eb3', '#cd9ad1', '#805882', '#55b7d6', '#c9a488', '#934e7c', '#f988aa', '#e99959', '#34b9dd', '#944b88', '#72bb86', '#5354d9', '#6f49d9', '#9b1ce0', '#b51e9b', '#8a24f3', '#c11e60', '#c11478', '#3953ec', '#8b1bf9', '#9a31c6', '#c80b55', '#9e23d3', '#6a3cf9', '#b31fa1', '#9c2bcd', '#843fd3', '#ae22ad', '#a427c0', '#b32795', '#5f48ec', '#ab24b4', '#7a39ec', '#961fe6', '#544fe6', '#cd032b', '#a22eba', '#b92383', '#c91824', '#ca0743', '#bf167d', '#cc0438', '#664dd9', '#544cec', '#c81831', '#b72489', '#9133d3', '#c51b49', '#385cd2', '#723fec', '#7143e6', '#4757d9', '#9713ed', '#3956e5', '#a019d9', '#c70d5a', '#c41b4f', '#ba1a8f', '#6550d2', '#c4116c', '#8831e6', '#7b34f3', '#932ed9', '#892bec', '#7d44d3', '#c51066', '#395ad9', '#ab2aa7', '#c7193d', '#f87afa', '#853bd9', '#cd011e', '#be2072', '#374ef9', '#8e2fe0'];
    };
  }

  angular.module('uncertApp.utils').service('HelperFunctions', HelperFunctions);
})();
