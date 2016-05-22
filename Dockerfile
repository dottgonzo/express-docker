FROM dottgonzo/mininode
RUN git clone xxx .
RUN git clone yyy ./site
RUN npm i --production
CMD ["node", "index"]