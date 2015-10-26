BEGIN { filnum = 1
        outfil = filnum ".naf"
      }


{  s = $0
    while ( match(s, "</[nN][aA][fF]>") ) {
	part = substr(s, 1, RSTART + RLENGTH - 1)
        print part >> outfil
        filnum++
        outfil = filnum ".naf"
        s = substr(s, RSTART+RLENGTH)
    }
    if (length(s) >0) {
       print s >> outfil
    }
}

    
