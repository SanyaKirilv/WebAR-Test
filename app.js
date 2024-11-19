var markersURLArray=[];
var markersNameArray=[];

AFRAME.registerComponent('markers_start',{
  init:function(){
    console.log('Add markers to the scene');
    var sceneEl = document.querySelector('a-scene');
    
    //lists of the markers
    for(var i=1; i<1; i++)
    {
      var url="marker.patt";
      markersURLArray.push(url);
      markersNameArray.push('Marker_'+i);      
    }

    for(var k=0; k<1; k++)
    {
      var markerEl = document.createElement('a-marker');
      markerEl.setAttribute('type','pattern');
      markerEl.setAttribute('url',markersURLArray[k]);
      markerEl.setAttribute('id',markersNameArray[k]);

      markerEl.setAttribute('registerevents','');
      sceneEl.appendChild(markerEl);

      //Adding a text to each marker
      var textEl = document.createElement('a-entity');
      
      textEl.setAttribute('id','text');
      textEl.setAttribute('text',{color: 'red', align: 'center', value:markersNameArray[k], width: '5.5'});
      textEl.object3D.position.set(0, 0.7, 0);
      textEl.object3D.rotation.set(-90, 0, 0);

      markerEl.appendChild(textEl);
    }
  }
});